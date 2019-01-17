import { hackHeader } from '../hack_header';

// eslint-disable-next-line import/no-dynamic-require
const request = require('request').defaults({ jar: true });

class CookieProvider {
  constructor() {
    this.data = {};
  }

  getCookie(url, name, callback) {
    const domain = this.getDomain(url);
    if (this.data[domain] == null) {
      return callback('');
    }
    return callback(this.data[domain][name]);
  }

  setCookie(url, name, value) {
    const domain = this.getDomain(url);
    if (this.data[domain] == null) {
      this.data[domain] = {};
    }
    this.data[domain][name] = value;
  }

  getCookieForHTTPHeader(url) {
    const domain = this.getDomain(url);
    if (this.data[domain] == null) {
      return '';
    }
    const kvArray = [];
    Object.keys(this.data[domain]).forEach((k) => {
      const v = this.data[domain][k];
      kvArray.push(`${k}=${v}`);
    });
    return `${kvArray.join(';')};`;
  }

  // eslint-disable-next-line class-methods-use-this
  getDomain(url) {
    const matches = url.match(/^https?:\/\/([^/?#]+)(?:[/?#]|$)/i);
    const domain = matches && matches[1];
    return domain;
  }
}

function HTTPClient(params) {
  // console.log(params);
  // cookieProvider in params? should update it
  return new Promise((resolve, reject) => {
    let headers = {
      // eslint-disable-next-line max-len
      'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.77 Safari/537.36',
    };
    if (params.headers !== undefined) {
      headers = Object.assign(headers, params.headers);
    }
    const action = hackHeader(params.url);
    if (action.add_referer || (action.replace_referer && headers.Referer === undefined)) {
      headers.Referer = action.referer_value;
    }
    if (action.add_origin || (action.replace_origin && headers.Origin === undefined)) {
      headers.Origin = action.referer_value;
    }
    // if cookie provider is provided, send cookie related to this domain
    if (params.cookieProvider !== undefined) {
      headers.Cookie = params.cookieProvider.getCookieForHTTPHeader(params.url);
    }
    if (params.method === 'GET') {
      return request.get({
        headers,
        uri: params.url,
      }, (error, response, body) => {
        if (error) {
          return reject();
        }
        if (params.cookieProvider !== undefined && response.headers['set-cookie'] !== undefined) {
          response.headers['set-cookie'].forEach((cookieString) => {
            const kvString = cookieString.split(';')[0];
            const k = kvString.split('=')[0];
            const v = kvString.split('=')[1];
            params.cookieProvider.setCookie(params.url, k, v);
          });
        }
        if (params.transformResponse === false) {
          return resolve({
            data: body,
          });
        }
        return resolve({
          data: JSON.parse(body),
        });
      });
    } if (params.method === 'POST') {
      return request.post({
        headers,
        uri: params.url,
        form: params.data,
      }, (error, response, body) => {
        if (error) {
          return reject();
        }
        if (params.transformResponse === false) {
          return resolve({
            data: body,
          });
        }
        return resolve({
          data: JSON.parse(body),
        });
      });
    }
    return null;
  });
}
export default { CookieProvider, HTTPClient };
