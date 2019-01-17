# listen1-api

listen1音乐资源API库，可运行在 Nodejs 和 浏览器环境（限chrome extension 或 electron）

## 特性

* 集成网易，QQ，虾米，酷狗，酷我，Bilibili平台的音乐资源API
* 支持获取热门歌单，歌手歌单，专辑歌单
* 支持搜索歌曲
* 支持获取歌曲歌词信息
* 支持获取歌曲的播放地址

## 编译
```
$ git clone git@github.com:listen1/listen1-api.git
$ cd listen1-api
$ yarn install
$ yarn build
```
编译后文件在dist目录下，`listen1-api.js`和`listen1-api.min.js`

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

## 项目技术
* 使用[webpack-library-starter](https://github.com/krasimir/webpack-library-starter.git)模板建立项目。
* 基于Webpack 4打包。
* ES6 语法。
* 导出[umd](https://github.com/umdjs/umd)格式的包，支持在浏览器环境和nodejs环境运行。
* ES6 测试基于 [Mocha](http://mochajs.org/) 和 [Chai](http://chaijs.com/)。
* 使用[ESLint](http://eslint.org/)进行语法检查。

## 常用命令

* `yarn build` or `npm run build` - 在dist目录下编译生成正式版的库文件。
* `yarn dev` or `npm run dev` - 编译生成dev版本的库并实时更新。
* `yarn test` or `npm run test` - 运行测试。
* `yarn test:watch` or `npm run test:watch` - 在watch模式运行测试。
