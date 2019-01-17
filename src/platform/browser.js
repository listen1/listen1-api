// function getDomain(url) {
//   const matches = url.match(/^https?:\/\/([^/?#]+)(?:[/?#]|$)/i);
//   const domain = matches && matches[1];
//   return domain;
// }

function getCookieProvider() {
  // const domain = 'https://www.xiami.com';
  // const name = 'xm_sg_tk';
  const cookieProvider = {};
  if (typeof chrome !== 'undefined') {
    // chrome cookie provider
    // eslint-disable-next-line func-names
    cookieProvider.getCookie = function (url, name, callback) {
      // eslint-disable-next-line no-undef
      chrome.cookies.get({
        url,
        name,
      }, (cookie) => {
        if (cookie == null) {
          return callback('');
        }
        return callback(cookie.value);
      });
    };
  } else {
    // TODO: fix electron auto load, now webpack will require electron in any platform build.
    // // electron cookie provider
    // cookieProvider.getCookie = function getCookie(url, name, callback) {
    //   // trick to avoid require electron not found in compile time
    //   const remote = require('electron').remote; // eslint-disable-line
    //   const domain = getDomain(url);
    //   remote.session.defaultSession.cookies.get({
    //     domain,
    //     name,
    //   }, (err, cookie) => {
    //     if (cookie.length === 0) {
    //       return callback('');
    //     }
    //     return callback(cookie[0].value);
    //   });
    // };
  }
  return cookieProvider;
}

export default { CookieProvider: getCookieProvider() };
