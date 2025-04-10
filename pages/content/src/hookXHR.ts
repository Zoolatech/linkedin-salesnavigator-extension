import { EXTENSION_ID } from '@extension/env';
import { type ExternalMessage } from '@extension/shared-types';

interface HookedXMLHttpRequest extends XMLHttpRequest {
  _method?: string;
  _url?: string | URL;
  _requestHeaders?: Record<string, string>;
}

const MATCHED_METHODS = /^get|post|put|delete|patch$/i;

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
        if (this.readyState !== this.DONE || this.status !== 200) {
          return;
        }

        if (!this.getResponseHeader('Content-Type')?.includes('json')) {
          console.log('Response is not JSON, skipping', this.getResponseHeader('Content-Type'));
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
            console.log('Response type is unknown, skipping', this._url, this.responseType);
            return;
        }

        if (responseObject === undefined) {
          try {
            responseObject = JSON.parse(jsonData || '');
          } catch (err) {
            console.log('Response is not parsable JSON, skipping', this._url, err);
            return;
          }
        }

        chrome.runtime.sendMessage(
          EXTENSION_ID,
          {
            type: 'XHR',
            data: {
              url: this._url,
              method: this._method,
              requestHeaders: this._requestHeaders,
              requestBody: body,
              responseHeaders: this.getAllResponseHeaders(),
              responseObject,
            },
          } satisfies ExternalMessage,
          response => {
            if (response === undefined) {
              console.error('Error sending message:', chrome.runtime.lastError);
              return;
            }
            if (Array.isArray(response)) {
              console.log('URLs to fetch:', response);
              fetchUrls(response, this._requestHeaders || {});
            } else {
              console.log('Unexpected response:', response);
            }
          },
        );
      });
    }

    return send.apply(this, [body]);
  };
}

function fetchUrls(urls: string[], headers: Record<string, string>) {
  urls.forEach((url, index) => {
    setTimeout(() => {
      const xhr = new XMLHttpRequest();
      xhr.open('GET', url, true);
      Object.entries(headers).forEach(([key, value]) => {
        xhr.setRequestHeader(key, value);
      });
      xhr.send();
    }, index * 2000);
  });
}

const toFetch: XMLHttpRequest[] = [];
let fetchIntervalID: number | undefined = undefined;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function fetchUrls2(urls: string[], headers: Record<string, string>) {
  urls.forEach(url => {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    Object.entries(headers).forEach(([key, value]) => {
      xhr.setRequestHeader(key, value);
    });
    toFetch.push(xhr);
  });
  scheduleFetch();
}

function scheduleFetch() {
  chrome.runtime.sendMessage(
    EXTENSION_ID,
    {
      type: 'FETCH_PROGRESS',
      data: { left: toFetch.length },
    } satisfies ExternalMessage,
    response => {
      if (response === undefined && chrome.runtime.lastError) {
        console.error('Error sending message:', chrome.runtime.lastError);
        return;
      }
    },
  );

  if (toFetch.length === 0) {
    window.clearInterval(fetchIntervalID);
    fetchIntervalID = undefined;
    return;
  }
  if (fetchIntervalID === undefined) {
    fetchIntervalID = window.setInterval(fetchOne, 2000);
  }
}

function fetchOne() {
  const xhr = toFetch.shift();
  if (xhr !== undefined) {
    xhr.send();
  }
  scheduleFetch();
}
