function hackHeader(url) {
  const replace_referer = true;
  let replace_origin = true;
  const add_referer = true;
  let add_origin = true;

  let referer_value = '';

  if (url.indexOf('://music.163.com/') !== -1) {
    referer_value = 'http://music.163.com/';
  }
  if (url.indexOf('://gist.githubusercontent.com/') !== -1) {
    referer_value = 'https://gist.githubusercontent.com/';
  }

  if (url.indexOf('api.xiami.com/') !== -1 || url.indexOf('.xiami.com/song/playlist/id/') !== -1
      || url.indexOf('www.xiami.com/api/') !== -1
  ) {
    add_origin = false;
    referer_value = 'https://www.xiami.com';
  }

  if (url.indexOf('www.xiami.com/api/search/searchSongs') !== -1) {
    const key = /key%22:%22(.*?)%22/.exec(url)[1];
    replace_origin = false;
    add_origin = false;
    referer_value = `https://www.xiami.com/search?key=${key}`;
  }

  if (url.indexOf('c.y.qq.com/') !== -1) {
    referer_value = 'https://y.qq.com';
  }
  if ((url.indexOf('i.y.qq.com/') !== -1)
      || (url.indexOf('qqmusic.qq.com/') !== -1)
      || (url.indexOf('music.qq.com/') !== -1)
      || (url.indexOf('imgcache.qq.com/') !== -1)) {
    referer_value = 'https://y.qq.com/';
  }

  if (url.indexOf('.kugou.com/') !== -1) {
    referer_value = 'http://www.kugou.com/';
  }

  if (url.indexOf('.kuwo.cn/') !== -1) {
    referer_value = 'http://www.kuwo.cn/';
  }

  if (url.indexOf('.bilibili.com/') !== -1) {
    referer_value = 'http://www.bilibili.com/';
    replace_origin = false;
    add_origin = false;
  }

  return {
    replace_referer, add_referer, replace_origin, add_origin, referer_value,
  };
}

export default { hackHeader };
