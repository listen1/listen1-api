# API

## apiGet
> listen1Api.apiGet(url, httpFunction, promiseFunction, cookieProviderClass) ⇒ Promise resolve(json_object)

访问音乐资源API

| 参数 | 类型 | 必须 | 描述 |
| --- | --- | --- | --- |
| url | <code>string</code> | 是| 音乐资源API, 详细参数规范见下面说明 |
| httpFunction | <code>object</code> | 否 | HTTP请求实现函数 |
| promiseFunction | <code>object</code> | 否 | Promise实现函数 |
| cookieProviderClass | <code>object</code> | 否 | Cookie管理实现类 |

除url以外的三个参数是兼容自定义运行环境时需要传入的，详细情况请参考 运行环境兼容性

### /show_playlist

获取平台热门歌单列表

| 参数 | 类型 | 必须 | 描述 |
| --- | --- | --- | --- |
| source | <code>string</code> | 是 | 平台名称(netease, qq, xiami, kugou, kuwo, bilibili) |
| offset | <code>number</code> | 否 | 列表起始位置，默认值为0。如第一次offset=0， 获得30个歌单（具体数值根据平台不同而不同），offset=30获取下30个|

返回

返回结果为Promise，resolve后为JSON对象。

| 字段 | 类型 | 描述 |
| --- | --- | --- |
| result | <code>[Playlist]</code> | 歌单数组，包含歌单对象 |


例子
```javascript
const listen1Api = require('./listen1-api');
const source = 'netease';
const url = '/show_playlist?source='+source;

listen1Api.apiGet(url).then((data) => {
  console.log(data);
});

// 如果node环境支持await语法
async function fetchShowplaylist() {
  const data = await listen1Api.apiGet(`/show_playlist?source=${platform}`);
  console.log(data);
}

fetchShowplaylist();
```

### /get_playlist

获取歌单详情

| 参数 | 类型 | 必须 | 描述 |
| --- | --- | --- | --- |
| list_id | <code>string</code> | 是 | 歌单id，歌单id可以是播放列表，也可以是歌手id，专辑id |

返回

返回结果为Promise，resolve后为JSON对象。

| 字段 | 类型 | 描述 |
| --- | --- | --- |
| info | <code>Playlist</code> | 歌单数组，包含歌单对象 |
| tracks | <code>[Track]</code> | 歌曲数组，包含歌曲对象 |

例子
```javascript
const listen1Api = require('./listen1-api');
const listId = 'neplaylist_762840531';
const url = '/get_playlist?list_id='+listId;

listen1Api.apiGet(url).then((data) => {
  console.log(data);
});
```

### /search

搜索歌曲

| 参数 | 类型 | 必须 | 描述 |
| --- | --- | --- | --- |
| source | <code>string</code> | 是 | 平台名称(netease, qq, xiami, kugou, kuwo, bilibili) |
| keywords | <code>string</code> | 是 | 搜索关键字 |
| curpage | <code>number</code> | 否 | 搜索页码，默认值为1 |

返回

返回结果为Promise，resolve后为JSON对象。

| 字段 | 类型 | 描述 |
| --- | --- | --- |
| total | <code>number</code> | 共搜索到的结果总数 |
| result | <code>[Track]</code> | 歌曲数组，包含歌曲对象 |


### /lyric

获取歌曲歌词信息

| 参数 | 类型 | 必须 | 描述 |
| --- | --- | --- | --- |
| track_id | <code>string</code> | 是 | 歌曲id |

返回

返回结果为Promise，resolve后为JSON对象。

| 字段 | 类型 | 描述 |
| --- | --- | --- |
| lyric | <code>string</code> | lyric格式的歌词信息 |

### /bootstrap_track

获取歌曲的播放地址

| 参数 | 类型 | 必须 | 描述 |
| --- | --- | --- | --- |
| track_id | <code>string</code> | 是 | 歌曲id |

返回

返回结果为Promise，resolve后为JSON对象。

| 字段 | 类型 | 描述 |
| --- | --- | --- |
| url | <code>string</code> | 歌曲的播放地址 |

## APIGET 返回结果 JSON 对象定义
### Playlist

歌单对象

| 字段 | 类型 | 描述 |
| --- | --- | --- |
| id | <code>string</code> | 歌单id，一般以平台前缀+playlist_[歌单id]作为标识，比如 qqplaylist_123456 |
| cover_img_url | <code>string</code> | 歌单封面url |
| title | <code>string</code> | 歌单标题 |
| source_url | <code>source_url</code> | 歌单来源网页url |

### Track

歌曲对象

| 字段 | 类型 | 描述 |
| --- | --- | --- |
| id | <code>string</code> | 歌曲id，一般以平台前缀+track_[歌曲id]作为标识，比如 qqtrack_123456 |
| img_url | <code>string</code> | 歌曲封面url |
| title | <code>string</code> | 歌曲标题 |
| source | <code>string</code> | 歌曲来源标识，比如netease |
| source_url | <code>string</code> | 歌曲来源网页url |
| artist | <code>string</code> | 歌手名 |
| artist_id | <code>string</code> | 歌手id, 一般以平台前缀+artist_[歌手id]作为标识，比如 qqartist_123456 |
| album | <code>string</code> | 专辑名 |
| album_id | <code>string</code> | 专辑id, 一般以平台前缀+album_[专辑id]作为标识，比如 qqalbum_123456 |
| lyric_url | <code>string</code> | 歌曲歌词url（可选，根据平台不同）  |
| url | <code>string</code> | 备用，现在值和歌曲id相同  |

## hackHeader
> listen1Api.hackHeader(url) ⇒ {}

跨域header处理，修改header中的Referer字段和Origin字段，使其符合同源规则

返回结果

| 字段 | 类型 | 描述 |
| --- | --- | --- |
| replace_referer | <code>bool</code> | 是否替代referer字段 |
| add_referer | <code>bool</code> | 是否增加referer字段 |
| replace_origin | <code>bool</code> | 是否替代origin字段 |
| add_origin | <code>bool</code> | 是否替代origin字段 |
| referer_value | <code>string</code> | referer或origin的修正值 |