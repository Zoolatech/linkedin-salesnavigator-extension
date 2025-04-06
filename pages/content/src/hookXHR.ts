interface XMLHttpRequest {
  _method: string | null;
  _url: string | URL;
  _requestHeaders: Record<string, string>;
  open(method: string, url: string | URL, async: boolean, username?: string | null, password?: string | null): void;
  setRequestHeader(name: string, value: string): void;
  send(body?: Document | XMLHttpRequestBodyInit | null): void;
  getAllResponseHeaders(): string;
  addEventListener(type: string, listener: EventListenerOrEventListenerObject): void;
  responseType: XMLHttpRequestResponseType;
  responseText: string;
}

export function hookXHR() {
  const XHR: XMLHttpRequest = XMLHttpRequest.prototype as unknown as XMLHttpRequest;

  const open = XHR.open;
  const send = XHR.send;
  const setRequestHeader = XHR.setRequestHeader;

  XHR.open = function (
    method: string,
    url: string | URL,
    async: boolean,
    username?: string | null,
    password?: string | null,
  ): void {
    this._method = method;
    this._url = url;
    this._requestHeaders = {};

    open.apply(this, [method, url, async, username, password]);
  };

  XHR.setRequestHeader = function (name: string, value: string): void {
    this._requestHeaders[name] = value;
    return setRequestHeader.apply(this, [name, value]);
  };

  XHR.send = function (body?: Document | XMLHttpRequestBodyInit | null): void {
    console.log('Request URL:', this._url);
    console.log('Request Method:', this._method);
    console.log('Request Headers:', this._requestHeaders);
    console.log('Request Body:', body);

    this.addEventListener('load', () => {
      // const endTime = new Date().toISOString();
      console.log('Got response:', this._url);
      console.log('Response Type:', this.responseType);
      console.log('Response Headers:', this.getAllResponseHeaders());

      // if (this._url) {

      if (this.responseType != 'blob' && this.responseText) {
        // responseText is string or null
        try {
          console.log('Response Text:', this.responseText);
        } catch (err) {
          console.log('Error in responseType try catch');
          console.log(err);
        }
      }
      // }
    });

    return send.apply(this, [body]);
  };
}
