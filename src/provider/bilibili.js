/* eslint-disable no-unused-vars */
/* Author: @71e6fd52 */
import { getParameterByName } from '../utils';

function build_bilibili() {
  function bi_convert_song(song_info) {
    const track = {
      id: `bitrack_${song_info.id}`,
      title: song_info.title,
      artist: song_info.uname,
      artist_id: `biartist_${song_info.uid}`,
      source: 'bilibili',
      source_url: `https://www.bilibili.com/audio/au${song_info.id}`,
      img_url: song_info.cover,
      url: song_info.id,
      lyric_url: song_info.lyric,
    };
    return track;
  }

  function bi_show_playlist(url, hm, pfn) {
    let offset = getParameterByName('offset', url);
    if (offset === undefined) {
      offset = 0;
    }
    const page = offset / 20 + 1;
    const target_url = `https://www.bilibili.com/audio/music-service-c/web/menu/hit?ps=20&pn=${page}`;
    return pfn((resolve, reject) => {
      hm({ url: target_url, method: 'GET' }).then((response) => {
        const { data } = response.data.data;
        const result = data.map(item => ({
          cover_img_url: item.cover,
          title: item.title,
          id: `biplaylist_${item.menuId}`,
          source_url: `https://www.bilibili.com/audio/am${item.menuId}`,
        }));
        return resolve({
          result,
        });
      });
    });
  }

  function bi_get_playlist(url, hm, pfn) { // eslint-disable-line no-unused-vars
    const list_id = getParameterByName('list_id', url).split('_').pop();
    const target_url = `https://www.bilibili.com/audio/music-service-c/web/menu/info?sid=${list_id}`;
    return pfn((resolve, reject) => {
      hm({ url: target_url, method: 'GET' }).then((response) => {
        const { data } = response.data;
        const info = {
          cover_img_url: data.cover,
          title: data.title,
          id: `biplaylist_${list_id}`,
          source_url: `https://www.bilibili.com/audio/am${list_id}`,
        };
        const target = `https://www.bilibili.com/audio/music-service-c/web/song/of-menu?pn=1&ps=100&sid=${list_id}`;
        hm({ url: target, method: 'GET' }).then((res) => {
          const tracks = res.data.data.data.map(item => bi_convert_song(item));
          return resolve({
            info,
            tracks,
          });
        });
      });
    });
  }
  function bi_album(url, hm, pfn) { // eslint-disable-line no-unused-vars
    return pfn((resolve, reject) => resolve({
      tracks: [],
      info: {},
    }));
    // bilibili havn't album
    // const album_id = getParameterByName('list_id', url).split('_').pop();
    // const target_url = '';
    // hm({url:target_url, method:'GET'}).then((response) => {
    //   const data = response.data;
    //   const info = {};
    //   const tracks = [];
    //   return fn({
    //     tracks,
    //     info,
    //   });
    // });
  }
  function bi_artist(url, hm, pfn) { // eslint-disable-line no-unused-vars
    return pfn((resolve, reject) => {
      const artist_id = getParameterByName('list_id', url).split('_').pop();
      let target_url = 'https://space.bilibili.com/ajax/member/GetInfo';
      hm({
        url: target_url,
        method: 'POST',
        data: { mid: artist_id },
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      })
        .then((response) => {
          const { data } = response.data;
          const info = {
            cover_img_url: data.face,
            title: data.name,
            id: `biartist_${artist_id}`,
            source_url: `https://space.bilibili.com/${artist_id}/#/audio`,
          };
          // eslint-disable-next-line max-len
          target_url = `https://api.bilibili.com/audio/music-service-c/web/song/upper?pn=1&ps=0&order=2&uid=${artist_id}`;
          hm({ url: target_url, method: 'GET' }).then((res) => {
            const tracks = res.data.data.data.map(item => bi_convert_song(item));
            return resolve({
              tracks,
              info,
            });
          });
        });
    });
  }
  function bi_parse_url(url) {
    let result;
    const match = /\/\/www.bilibili.com\/audio\/am([0-9]+)/.exec(url);
    if (match != null) {
      const playlist_id = match[1];
      result = {
        type: 'playlist',
        id: `biplaylist_${playlist_id}`,
      };
    }
    return result;
  }
  // eslint-disable-next-line no-unused-vars
  function bi_bootstrap_track(trackId, hm, pfn) {
    const song_id = trackId.slice('bitrack_'.length);
    const target_url = `https://www.bilibili.com/audio/music-service-c/web/url?sid=${song_id}`;
    return pfn((resolve, reject) => {
      hm({ url: target_url, method: 'GET' }).then((response) => {
        const { data } = response;
        if (data.code === 0) {
          resolve({ url: data.data.cdns[0] });
        } else {
          reject();
        }
      });
    });
  }
  function bi_search(url, hm, pfn) { // eslint-disable-line no-unused-vars
    return pfn((resolve, reject) => {
      const keyword = getParameterByName('keywords', url);
      const curpage = getParameterByName('curpage', url);
      const au = /\d+$/.exec(keyword);
      if (au != null) {
        const target_url = `https://www.bilibili.com/audio/music-service-c/web/song/info?sid=${au}`;
        hm({ url: target_url, method: 'GET' }).then((response) => {
          const { data } = response.data;
          const tracks = [bi_convert_song(data)];
          return resolve({
            result: tracks,
            total: 1,
          });
        });
      } else {
        return resolve({
          result: [],
          total: 0,
        });
      }
      // inferred, not implemented yet
      // eslint-disable-next-line max-len
      const target_url = `https://api.bilibili.com/x/web-interface/search/type?search_type=audio&keyword=${keyword}&page=${curpage}`;
      hm({ url: target_url, method: 'GET' }).then((response) => {
        const { data } = response.data;
        const tracks = data.result.map(item => bi_convert_song(item));
        return resolve({
          result: tracks,
          total: data.numResults,
        });
      });
      return null;
    });
  }
  function bi_lyric(url, hm, pfn) { // eslint-disable-line no-unused-vars
    // const track_id = getParameterByName('track_id', url).split('_').pop();
    const lyric_url = getParameterByName('lyric_url', url);
    return pfn((resolve, reject) => {
      hm({ url: lyric_url, method: 'GET' }).then((response) => {
        const { data } = response;
        return resolve({
          lyric: data,
        });
      });
    });
  }

  function get_playlist(url, hm, pfn) {
    const list_id = getParameterByName('list_id', url).split('_')[0];
    switch (list_id) {
      case 'biplaylist':
        return bi_get_playlist(url, hm, pfn);
      case 'bialbum':
        return bi_album(url, hm, pfn);
      case 'biartist':
        return bi_artist(url, hm, pfn);
      default:
        return null;
    }
  }

  return {
    showPlaylist: bi_show_playlist,
    getPlaylist: get_playlist,
    parseUrl: bi_parse_url,
    bootstrapTrack: bi_bootstrap_track,
    search: bi_search,
    lyric: bi_lyric,
  };
}

export default build_bilibili(); // eslint-disable-line no-unused-vars
