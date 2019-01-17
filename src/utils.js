function getParameterByName(name, url) {
  // if (!url) url = window.location.href;
  const replacedName = name.replace(/[[\]]/g, '\\$&');
  const regex = new RegExp(`[?&]${replacedName}(=([^&#]*)|&|#|$)`);
  const results = regex.exec(url);

  if (!results) return null;
  if (!results[2]) return '';
  return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

function getRandomHexString(size) {
  const result = [];
  const choice = '012345679abcdef'.split('');
  for (let i = 0; i < size; i += 1) {
    const index = Math.floor(Math.random() * choice.length);
    result.push(choice[index]);
  }
  return result.join('');
}

function httpParamEncode(obj) {
  const str = [];
  Object.keys(obj).forEach((key) => {
    str.push(`${encodeURIComponent(key)}=${encodeURIComponent(obj[key])}`);
  });
  return str.join('&');
}

export default { getParameterByName, getRandomHexString, httpParamEncode };
