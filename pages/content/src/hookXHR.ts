import { EXTENSION_ID } from '@extension/env';
import type { RecordedXHR, XHRRequest, ExternalMessage } from '@extension/shared-types';

interface HookedXMLHttpRequest extends XMLHttpRequest {
  _method?: string;
  _url?: string | URL;
  _requestHeaders?: Record<string, string>;
}

const MATCHED_METHODS = /^get|post|put|delete|patch$/i;

let LOGGING = false;
export function toggleLogging() {
  LOGGING = !LOGGING;
}

export function hookXHR() {
  const XHR: HookedXMLHttpRequest = XMLHttpRequest.prototype as HookedXMLHttpRequest;

  const open = XHR.open;
  const send = XHR.send;
  const setRequestHeader = XHR.setRequestHeader;

  XHR.open = function (
    method: string,
    url: string | URL,
    async: boolean = true,
    username?: string | null,
    password?: string | null,
  ): void {
    this._method = method;
    this._url = url;
    this._requestHeaders = {};

    open.apply(this, [method, url, async, username, password]);
  };

  XHR.setRequestHeader = function (name: string, value: string): void {
    if (this._requestHeaders === undefined) {
      this._requestHeaders = {};
    }
    this._requestHeaders[name] = value;
    return setRequestHeader.apply(this, [name, value]);
  };

  XHR.send = function (body?: Document | XMLHttpRequestBodyInit | null): void {
    if (this._method === undefined || MATCHED_METHODS.test(this._method)) {
      this.addEventListener('load', async () => {
        if (this.readyState !== this.DONE) {
          return;
        }

        const sendXHRMessage = (data: RecordedXHR) => {
          try {
            chrome.runtime.sendMessage(EXTENSION_ID, { type: 'XHR', data } satisfies ExternalMessage);
          } catch (err) {
            console.error('Error sending message:', err);
            throw err;
          }
        };

        const baseData = {
          url: this._url?.toString(),
          method: this._method,
          requestHeaders: this._requestHeaders,
          requestBody: body,
          responseHeaders: this.getAllResponseHeaders(),
          responseStatus: this.status,
        };

        if (this.status !== 200) {
          sendXHRMessage(baseData);
          return;
        }

        if (!this.getResponseHeader('Content-Type')?.includes('json')) {
          if (LOGGING) console.log('Response is not JSON, skipping', this.getResponseHeader('Content-Type'));
          return;
        }

        let responseObject = undefined;
        let jsonData: string | undefined = undefined;
        switch (this.responseType) {
          case 'text':
          case '':
            jsonData = this.responseText;
            break;
          case 'json':
            responseObject = this.response;
            break;
          case 'blob':
            jsonData = await (this.response as Blob).text();
            break;
          case 'arraybuffer':
            jsonData = new TextDecoder('utf-8').decode(this.response as ArrayBuffer);
            break;
          default:
            if (LOGGING) console.log('Response type is unknown, skipping', this._url, this.responseType);
            return;
        }

        if (responseObject === undefined) {
          try {
            responseObject = JSON.parse(jsonData || '');
          } catch (err) {
            if (LOGGING) console.log('Response is not parsable JSON, skipping', this._url, err);
            return;
          }
        }

        if (LOGGING) console.log('Ready to serve:', { ...baseData, responseObject });
        sendXHRMessage({ ...baseData, responseObject });
      });
    }

    return send.apply(this, [body]);
  };
}

const FETCH_QUEUE: XHRRequest[] = [];

window.setInterval(() => {
  if (FETCH_QUEUE.length > 0) {
    const req = FETCH_QUEUE.shift();
    if (req !== undefined) {
      const xhr = new XMLHttpRequest();
      xhr.open(req.method ?? 'GET', req.url ?? '', true);
      Object.entries(req.requestHeaders ?? {}).forEach(([key, value]) => {
        xhr.setRequestHeader(key, value);
      });
      xhr.send(req.requestBody);
    }
  } else {
    try {
      chrome.runtime.sendMessage(
        EXTENSION_ID,
        { type: 'WORKER' } satisfies ExternalMessage,
        (response: XHRRequest[]) => {
          FETCH_QUEUE.push(...response);
        },
      );
    } catch (err) {
      console.error('Error sending message:', err);
      throw err;
    }
  }
}, 2000);
