import {
  getParameterByName,
  httpParamEncode,
} from './utils';
import { hackHeader } from './hack_header';
import NeteaseFactory from './provider/netease';
import XiamiFactory from './provider/xiami';
import QQFactory from './provider/qq';
import KugouFactory from './provider/kugou';
import KuwoFactory from './provider/kuwo';
import BiliFactory from './provider/bilibili';

function getAllProviders() {
  return [NeteaseFactory, QQFactory, XiamiFactory, KugouFactory, KuwoFactory, BiliFactory];
}

function getProviderByName(sourceName) {
  if (sourceName === 'netease') {
    return NeteaseFactory;
  }
  if (sourceName === 'xiami') {
    return XiamiFactory;
  }
  if (sourceName === 'qq') {
    return QQFactory;
  }
  if (sourceName === 'kugou') {
    return KugouFactory;
  }
  if (sourceName === 'kuwo') {
    return KuwoFactory;
  }
  if (sourceName === 'bilibili') {
    return BiliFactory;
  }
  return null;
}

function getProviderByItemId(itemId) {
  const prefix = itemId.slice(0, 2);
  if (prefix === 'ne') {
    return NeteaseFactory;
  }
  if (prefix === 'xm') {
    return XiamiFactory;
  }
  if (prefix === 'qq') {
    return QQFactory;
  }
  if (prefix === 'kg') {
    return KugouFactory;
  }
  if (prefix === 'kw') {
    return KuwoFactory;
  }
  if (prefix === 'bi') {
    return BiliFactory;
  }
  return null;
}

let globalCookieProvider = null;
let globalHTTPClient = null;
const platform = {};

function loadNodejsDefaults() {
  // eslint-disable-next-line global-require
  platform.nodejs = require('./platform/node');
  globalCookieProvider = new platform.nodejs.CookieProvider();
  globalHTTPClient = platform.nodejs.HTTPClient;
}
function loadBrowserDefaults() {
  // eslint-disable-next-line global-require
  platform.browser = require('./platform/browser');
  globalCookieProvider = platform.browser.CookieProvider;
}

if (typeof window === 'undefined') {
  // nodejs
  // eslint-disable-next-line global-require
  loadNodejsDefaults();
} else {
  // chrome
  // eslint-disable-next-line global-require
  loadBrowserDefaults();
}

function apiGet(url, httpClient, pfn, cookieProvider) {
  // default auto set
  if (httpClient === undefined || httpClient === null) {
    // eslint-disable-next-line no-param-reassign
    httpClient = globalHTTPClient;
  }
  if (pfn === undefined || pfn === null) {
    // eslint-disable-next-line no-param-reassign
    pfn = fn => new Promise(fn);
  }
  if (cookieProvider === undefined || cookieProvider === null) {
    // eslint-disable-next-line no-param-reassign
    cookieProvider = globalCookieProvider;
  }


  // router
  if (url.search('/show_playlist') !== -1) {
    const source = getParameterByName('source', url);
    const provider = getProviderByName(source);
    return provider.showPlaylist(url, httpClient, pfn, cookieProvider);
  }
  if (url.search('/playlist') !== -1) {
    const listId = getParameterByName('list_id', url);
    const provider = getProviderByItemId(listId);
    return provider.getPlaylist(url, httpClient, pfn, cookieProvider);
  }
  if (url.search('/search') !== -1) {
    const source = getParameterByName('source', url);
    const provider = getProviderByName(source);
    return provider.search(url, httpClient, pfn, cookieProvider);
  }
  if (url.search('/lyric') !== -1) {
    const trackId = getParameterByName('track_id', url);
    const provider = getProviderByItemId(trackId);
    return provider.lyric(url, httpClient, pfn, cookieProvider);
  }
  if (url.search('/bootstrap_track') !== -1) {
    const trackId = getParameterByName('track_id', url);
    const provider = getProviderByItemId(trackId);
    return provider.bootstrapTrack(trackId, httpClient, pfn, cookieProvider);
  }
  return null;
}

export default {
  getAllProviders,
  getProviderByItemId,
  getProviderByName,
  apiGet,
  hackHeader,
  httpParamEncode,
  platform,
  loadNodejsDefaults,
  loadBrowserDefaults,
};
