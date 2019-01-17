/* global describe, it */

import chai from 'chai';

const listen1Api = require('../dist/listen1-api');

chai.expect();

const { expect } = chai;
// force load nodejs, because mocha will use chrome setting by default
listen1Api.loadNodejsDefaults();
const { HTTPClient, CookieProvider } = listen1Api.platform.nodejs;
const globalCookieProvider = new CookieProvider();


function testPlatformShowList(platform) {
  describe(`Test Listen1 api ${platform}`, () => {
    describe(`when I need show playlist in ${platform}`, () => {
      it('should return the playlist info', () => listen1Api.apiGet(`/show_playlist?source=${platform}`, HTTPClient,
        null, globalCookieProvider).then((data) => {
        // console.log(data);
        expect(data).to.be.a('object');
        expect(data.result.length).to.be.above(0);
        const propertyArray = ['cover_img_url', 'title', 'id', 'source_url'];
        propertyArray.forEach((p) => {
          expect(data.result[0]).have.property(p);
        });
      }));
    });
  });
}

function testPlatformPlaylist(platform) {
  const platformTestList = {
    netease: ['neplaylist_762840531', 'neartist_31226', 'nealbum_501208'],
    qq: ['qqplaylist_4892242121', 'qqartist_003kBQDN4EZbEP', 'qqalbum_004Yw5KE09NoYI'],
    xiami: ['xmplaylist_377226457', 'xmartist_24182', 'xmalbum_172228'],
    kugou: ['kgplaylist_585003', 'kgartist_151896', 'kgalbum_1718145'],
    kuwo: ['kwplaylist_2661217147', 'kwartist_451', 'kwalbum_6865'],
    bilibili: ['biplaylist_10624', 'biartist_13943828'],
  };
  const listIds = platformTestList[platform];
  listIds.forEach((listId) => {
    describe(`Test Listen1 api ${platform}`, () => {
      describe(`when I need playlist ${listId} info`, () => {
        it('should return the playlist', () => listen1Api.apiGet(`/playlist?list_id=${listId}`, HTTPClient,
          null, globalCookieProvider).then((data) => {
          // console.log(data);
          expect(data).to.be.a('object');
          expect(data.info).to.be.a('object');
          expect(data.tracks).to.be.a('array');
          expect(data.tracks.length).to.be.above(0);
          const propertyArray = ['id', 'title', 'artist', 'artist_id', 'img_url',
            'source', 'source_url', 'url'];
          if (platform !== 'bilibili') {
            propertyArray.concat(['album', 'album_id']);
          }
          propertyArray.forEach((p) => {
            expect(data.tracks[0]).have.property(p);
          });
        }));
      });
    });
  });
}

function testSearch(platform) {
  describe(`Test Listen1 api ${platform}`, () => {
    describe(`when I search by ${platform}`, () => {
      it('should return the search result', () => listen1Api.apiGet(`/search?source=${platform}&keywords=123&curpage=1`,
        HTTPClient, null, globalCookieProvider).then((data) => {
        // console.log(data);
        expect(data).to.be.a('object');
        expect(data.total).to.be.a('number');
        expect(data.result).to.be.a('array');
        expect(data.result.length).to.be.above(0);
        const propertyArray = ['id', 'title', 'artist', 'artist_id', 'album', 'album_id', 'img_url',
          'source', 'source_url', 'url'];
        propertyArray.forEach((p) => {
          expect(data.result[0]).have.property(p);
        });
      }));
    });
  });
}

function testLyric(platform) {
  const trackIdsMapping = {
    netease: ['netrack_25642119'],
    qq: ['qqtrack_004J80Df0WKD7L'],
    // xiami lyric is from url lyric_url field, skip test it
    xiami: [],
    kugou: ['kgtrack_5078BEA97CC7F9F7ED8C8CB1071BB9CF'],
    kuwo: ['kwtrack_320411'],
    bilibili: ['bitrack_697129'],
  };
  const trackIds = trackIdsMapping[platform];
  trackIds.forEach((trackId) => {
    describe(`Test Listen1 api ${platform}`, () => {
      describe(`when I need the ${trackId} lyric`, () => {
        it('should return the lyric info', () => listen1Api.apiGet(`/lyric?track_id=${trackId}`, HTTPClient,
          null, globalCookieProvider).then((data) => {
          // console.log(data);
          expect(data).to.be.a('object');
          expect(data).have.property('lyric');
        }));
      });
    });
  });
}

function testBootstrapTrack(platform) {
  const trackIdsMapping = {
    netease: ['netrack_25642119'],
    qq: ['qqtrack_004J80Df0WKD7L'],
    xiami: ['xmtrack_1769683699'],
    kugou: ['kgtrack_5078BEA97CC7F9F7ED8C8CB1071BB9CF'],
    kuwo: ['kwtrack_320411'],
    bilibili: ['bitrack_697129'],
  };
  const trackIds = trackIdsMapping[platform];
  trackIds.forEach((trackId) => {
    describe(`Test Listen1 api ${platform}`, () => {
      describe(`when I need the ${trackId} info`, () => {
        it('should return the track info', () => listen1Api.apiGet(`/bootstrap_track?track_id=${trackId}`, HTTPClient,
          null, globalCookieProvider).then((data) => {
          // console.log(data);
          expect(data).to.be.a('object');
          expect(data).have.property('url');
        }));
      });
    });
  });
}

const platformList = ['netease', 'qq', 'xiami', 'kugou', 'kuwo', 'bilibili'];

platformList.forEach((name) => {
  testPlatformShowList(name);
  testPlatformPlaylist(name);
  if (name !== 'bilibili') {
    testSearch(name);
  }
  testBootstrapTrack(name);
  if (name !== 'xiami' && name !== 'kuwo' && name !== 'bilibili') {
    testLyric(name);
  }
});
