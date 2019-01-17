/* eslint-disable import/named */
/* eslint-disable no-unused-vars */
/* eslint-disable no-param-reassign */
import { getParameterByName, getRandomHexString } from '../utils';
import { aesEncrypt, rsaEncrypt } from '../crypto/crypto';

const $ = require('cheerio');

function encryptedRequest(text) {
  const modulus = '00e0b509f6259df8642dbc35662901477df22677ec152b5ff68ace615bb7b72'
    + '5152b3ab17a876aea8a5aa76d2e417629ec4ee341f56135fccf695280104e0312ecbd'
    + 'a92557c93870114af6c9d05c4f7f0c3685b7a46bee255932575cce10b424d813cfe48'
    + '75d3e82047b97ddef52741d546b8e289dc6935b3ece0462db0a22b8e7';
  const nonce = '0CoJUm6Qyw8W8jud';
  const pubKey = '010001';
  text = JSON.stringify(text);
  const secKey = getRandomHexString(16);
  const ivString = '0102030405060708';
  const encText = aesEncrypt(aesEncrypt(text, nonce, ivString), secKey, ivString);
  const encSecKey = rsaEncrypt(secKey, pubKey, modulus);
  const data = {
    params: encText,
    encSecKey,
  };

  return data;
}

function NeteaseFactory() {
  function neShowPlaylist(url, hm, pfn) {
    const order = 'hot';
    const offset = getParameterByName('offset', url);
    let targetUrl;

    if (offset != null) {
      targetUrl = `http://music.163.com/discover/playlist/?order=${order}&limit=35&offset=${offset}`;
    } else {
      targetUrl = `http://music.163.com/discover/playlist/?order=${order}`;
    }

    return pfn((resolve, reject) => {
      const result = [];

      hm({
        url: targetUrl,
        method: 'GET',
        transformResponse: false,
      }).then((response) => {
        let { data } = response;
        // TODO: replace jquery to raw document api
        data = $.parseHTML(data);
        // eslint-disable-next-line func-names
        $(data).find('.m-cvrlst li').each(function () {
          const defaultPlaylist = {
            cover_img_url: '',
            title: '',
            id: '',
            source_url: '',
          };

          defaultPlaylist.cover_img_url = $(this).find('img')[0].attribs.src;
          defaultPlaylist.title = $(this).find('div a')[0].attribs.title;
          const url2 = $(this).find('div a')[0].attribs.href;
          const listId = getParameterByName('id', url2);
          defaultPlaylist.id = `neplaylist_${listId}`;
          defaultPlaylist.source_url = `http://music.163.com/#/playlist?id=${listId}`;
          result.push(defaultPlaylist);
        });
        return resolve({
          result,
        });
      });
    });
  }

  // function neEnsureCookie(callback) {
  //   var domain = 'https://music.163.com';
  //   var nuidName = '_ntes_nuid';
  //   var nnidName = '_ntes_nnid';
  //   // TODO: replace chrome for dependency injection
  //   var chrome = {};
  //   chrome.cookies.get({
  //     'url': domain,
  //     'name': nuidName
  //   }, function (cookie) {
  //     if (cookie == null) {
  //       var nuidValue = getRandomHexString(32);
  //       var nnidValue = nuidValue + ',' + (new Date()).getTime();
  //       // netease default cookie expire time: 100 years
  //       var expire = ((new Date()).getTime() + 1e3 * 60 * 60 * 24 * 365 * 100) / 1000;

  //       chrome.cookies.set({
  //         'url': domain,
  //         'name': nuidName,
  //         'value': nuidValue,
  //         'expirationDate': expire
  //       }, function (cookie) {
  //         chrome.cookies.set({
  //           'url': domain,
  //           'name': nnidName,
  //           'value': nnidValue,
  //           'expirationDate': expire
  //         }, function (cookie2) {
  //           callback(cookie.value);
  //         });
  //       });
  //     } else {
  //       callback(cookie.value);
  //     }
  //   });
  // }

  function neGetPlaylist(url, hm, pfn) {
    // special thanks for @Binaryify
    // https://github.com/Binaryify/NeteaseCloudMusicApi
    return pfn((resolve, reject) => {
      const listId = getParameterByName('list_id', url).split('_').pop();
      const targetUrl = 'http://music.163.com/weapi/v3/playlist/detail';
      const d = {
        id: listId,
        offset: 0,
        total: true,
        limit: 1000,
        n: 1000,
        csrf_token: '',
      };
      const data = encryptedRequest(d);
      // neEnsureCookie(function () {
      hm({
        url: targetUrl,
        method: 'POST',
        data,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }).then((response) => {
        const { data: res_data } = response;
        const info = {
          id: `neplaylist_${listId}`,
          cover_img_url: res_data.playlist.coverImgUrl,
          title: res_data.playlist.name,
          source_url: `http://music.163.com/#/playlist?id=${listId}`,
        };
        const tracks = [];
        Array.prototype.forEach.call(res_data.playlist.tracks, (trackJson, index) => {
          const defaultTrack = {
            id: '0',
            title: '',
            artist: '',
            artist_id: 'neartist_0',
            album: '',
            album_id: 'nealbum_0',
            source: 'netease',
            source_url: 'http://www.xiami.com/song/0',
            img_url: '',
            url: '',
          };
          defaultTrack.id = `netrack_${trackJson.id}`;
          defaultTrack.title = trackJson.name;
          defaultTrack.artist = trackJson.ar[0].name;
          defaultTrack.artist_id = `neartist_${trackJson.ar[0].id}`;
          defaultTrack.album = trackJson.al.name;
          defaultTrack.album_id = `nealbum_${trackJson.al.id}`;
          defaultTrack.source_url = `http://music.163.com/#/song?id=${trackJson.id}`;
          defaultTrack.img_url = trackJson.al.picUrl;
          defaultTrack.url = defaultTrack.id;

          tracks.push(defaultTrack);
        });
        return resolve({
          info,
          tracks,
        });
      });
    });
  }

  function neBootstrapTrack(songId, hm, pfn) {
    const targetUrl = 'http://music.163.com/weapi/song/enhance/player/url?csrf_token=';
    const csrf = '';
    songId = songId.slice('netrack_'.length);
    const d = {
      ids: [songId],
      br: 320000,
      csrf_token: csrf,
    };
    const data = encryptedRequest(d);

    return pfn((resolve, reject) => {
      hm({
        url: targetUrl,
        method: 'POST',
        data,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }).then((response) => {
        const { data: res_data } = response;
        const { url } = res_data.data[0];
        if (url != null) {
          resolve({ url });
        } else {
          reject({});
        }
      });
    });
  }

  function isPlayable(song) {
    return ((song.status >= 0) && (song.fee !== 4));
  }

  function neSearch(url, hm, pfn) {
    // use chrome extension to modify referer.
    const targetUrl = 'http://music.163.com/api/search/pc';
    const keyword = getParameterByName('keywords', url);
    const curpage = getParameterByName('curpage', url);
    const reqData = {
      s: keyword,
      offset: 20 * (curpage - 1),
      limit: 20,
      type: 1,
    };
    return pfn((resolve, reject) => {
      hm({
        url: targetUrl,
        method: 'POST',
        data: reqData,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }).then((response) => {
        const { data } = response;
        const tracks = [];
        Array.prototype.forEach.call(data.result.songs, (songInfo, index) => {
          const defaultTrack = {
            id: `netrack_${songInfo.id}`,
            title: songInfo.name,
            artist: songInfo.artists[0].name,
            artist_id: `neartist_${songInfo.artists[0].id}`,
            album: songInfo.album.name,
            album_id: `nealbum_${songInfo.album.id}`,
            source: 'netease',
            source_url: `http://music.163.com/#/song?id=${songInfo.id}`,
            img_url: songInfo.album.picUrl,
            url: `netrack_${songInfo.id}`,
          };
          if (!isPlayable(songInfo)) {
            defaultTrack.disabled = true;
          } else {
            defaultTrack.disabled = false;
          }
          tracks.push(defaultTrack);
        });
        return resolve({
          result: tracks,
          total: data.result.songCount,
        });
      });
    });
  }

  function neAlbum(url, hm, pfn) {
    const albumId = getParameterByName('list_id', url).split('_').pop();
    // use chrome extension to modify referer.
    const targetUrl = `http://music.163.com/api/album/${albumId}`;

    return pfn((resolve, reject) => {
      hm({
        url: targetUrl,
        method: 'GET',
      }).then((response) => {
        const { data } = response;
        const info = {
          cover_img_url: data.album.picUrl,
          title: data.album.name,
          id: `nealbum_${data.album.id}`,
          source_url: `http://music.163.com/#/album?id=${data.album.id}`,
        };

        const tracks = [];
        Array.prototype.forEach.call(data.album.songs, (songInfo, index) => {
          const defaultTrack = {
            id: `netrack_${songInfo.id}`,
            title: songInfo.name,
            artist: songInfo.artists[0].name,
            artist_id: `neartist_${songInfo.artists[0].id}`,
            album: songInfo.album.name,
            album_id: `nealbum_${songInfo.album.id}`,
            source: 'netease',
            source_url: `http://music.163.com/#/song?id=${songInfo.id}`,
            img_url: songInfo.album.picUrl,
            url: `netrack_${songInfo.id}`,
          };
          if (!isPlayable(songInfo)) {
            defaultTrack.disabled = true;
          } else {
            defaultTrack.disabled = false;
          }
          tracks.push(defaultTrack);
        });
        return resolve({
          tracks,
          info,
        });
      });
    });
  }

  function neArtist(url, hm, pfn) {
    const artistId = getParameterByName('list_id', url).split('_').pop();
    // use chrome extension to modify referer.
    const targetUrl = `http://music.163.com/api/artist/${artistId}`;

    return pfn((resolve, reject) => {
      hm({
        url: targetUrl,
        method: 'GET',
      }).then((response) => {
        const { data } = response;
        const info = {
          cover_img_url: data.artist.picUrl,
          title: data.artist.name,
          id: `neartist_${data.artist.id}`,
          source_url: `http://music.163.com/#/artist?id=${data.artist.id}`,
        };

        const tracks = [];
        Array.prototype.forEach.call(data.hotSongs, (songInfo, i) => {
          const defaultTrack = {
            id: `netrack_${songInfo.id}`,
            title: songInfo.name,
            artist: songInfo.artists[0].name,
            artist_id: `neartist_${songInfo.artists[0].id}`,
            album: songInfo.album.name,
            album_id: `nealbum_${songInfo.album.id}`,
            source: 'netease',
            source_url: `http://music.163.com/#/song?id=${songInfo.id}`,
            img_url: songInfo.album.picUrl,
            url: `netrack_${songInfo.id}`,
          };
          if (!isPlayable(songInfo)) {
            defaultTrack.disabled = true;
          } else {
            defaultTrack.disabled = false;
          }
          tracks.push(defaultTrack);
        });
        return resolve({
          tracks,
          info,
        });
      });
    });
  }

  function neLyric(url, hm, pfn) {
    const trackId = getParameterByName('track_id', url).split('_').pop();
    // use chrome extension to modify referer.
    const targetUrl = 'http://music.163.com/weapi/song/lyric?csrf_token=';
    const csrf = '';
    const d = {
      id: trackId,
      lv: -1,
      tv: -1,
      csrf_token: csrf,
    };
    const data = encryptedRequest(d);
    return pfn((resolve, reject) => {
      hm({
        url: targetUrl,
        method: 'POST',
        data,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }).then((response) => {
        const { data: res_data } = response;
        let lrc = '';
        if (res_data.lrc != null) {
          lrc = res_data.lrc.lyric;
        }
        return resolve({
          lyric: lrc,
        });
      });
    });
  }

  function neParseUrl(url) {
    let result;
    url = url.replace('music.163.com/#/my/m/music/playlist?', 'music.163.com/#/playlist?');
    if (url.search('//music.163.com/#/m/playlist') !== -1 || url.search('//music.163.com/#/playlist') !== -1
     || url.search('//music.163.com/playlist') !== -1) {
      result = {
        type: 'playlist',
        id: `neplaylist_${getParameterByName('id', url)}`,
      };
    }
    return result;
  }

  function getPlaylist(url, hm, pfn) {
    const listId = getParameterByName('list_id', url).split('_')[0];
    if (listId === 'neplaylist') {
      return neGetPlaylist(url, hm, pfn);
    }
    if (listId === 'nealbum') {
      return neAlbum(url, hm, pfn);
    }
    if (listId === 'neartist') {
      return neArtist(url, hm, pfn);
    }
    return null;
  }

  return {
    showPlaylist: neShowPlaylist,
    getPlaylist,
    parseUrl: neParseUrl,
    bootstrapTrack: neBootstrapTrack,
    search: neSearch,
    lyric: neLyric,
  };
}

export default NeteaseFactory();
