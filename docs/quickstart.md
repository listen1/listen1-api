# 快速开始

## 下载
* 压缩版本 [下载](https://github.com/listen1/listen1-api/releases/download/v1.0.0/listen1-api.min.js)
* 非压缩版本[下载](https://github.com/listen1/listen1-api/releases/download/v1.0.0/listen1-api.js)

## 安装
浏览器环境
```html
<script src="listen1-api.min.js"></script>
<script>
  console.log(listen1Api);
</script>
```
Nodejs环境
```javascript
const listen1Api = require('./listen1-api.min');
```

## 开始使用 (nodejs 环境)

下载压缩版本，或dist目录下的`listen1-api.min.js`到本地目录

```javascript
const listen1Api = require('./listen1-api.min');
const platform = 'netease';
// 获取网易平台的热门歌单列表
const url = '/show_playlist?source='+platform;

listen1Api.apiGet(url).then((data) => {
  console.log(data);
});
```