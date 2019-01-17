## 开发使用

1. 编译生成
  * 运行 `yarn install` (推荐) 或 `npm install` ，安装依赖包。
  * 运行 `yarn build` 或 `npm run build` 来生成压缩版本的库文件。
2. 开发者模式
  * 运行 `yarn dev` 或 `npm run dev` 安装依赖包。生成一个非压缩版本的库文件并且在文件变化时自动重新编译。
3. 运行测试
  * 运行 `yarn test` 或 `npm run test`。

## 运行环境兼容性

listen1-api本身是umd库，支持运行在nodejs和浏览器环境。但其中一些功能和运行环境相关。所以，如果需要兼容多种兼容环境时，请考虑按照一下接口定义扩展如下类：
httpFunction, promiseFunction, cookieProviderClass。

listen1-api默认会根据程序环境选择默认的类，可以参考 `/platform` 目录下的代码

### httpFunction
> httpFunction(params) ⇒ Promise resolve(json_object)

http请求函数

params是一个字典，包含参数如下

| 参数 | 类型 | 必须 | 描述 |
| --- | --- | --- | --- |
| url | <code>string</code> | 是| 访问url |
| method | <code>string</code> | 是 |  |
| transformResponse | <code>bool</code> | 否 | 是否将结果转换为JSON对象 |
| data | <code>object</code> | 否 | 请求为POST时，传递的表单内容 |
| cookieProvider | <code>object</code> | 否 | cookie管理类 |


### promiseFunction
> promiseFunction((resolve, reject)=>{}) ⇒ Promise

api使用的promise函数。一般都为系统默认的 new Promise，但angularjs中需要传入`$q`，否则不会触发数据刷新。

### cookieProviderClass
cookie管理类

需要实现如下接口

getCookie

| 参数 | 类型 | 必须 | 描述 |
| --- | --- | --- | --- |
| url | <code>string</code> | 是| 访问url |
| name | <code>string</code> | 是| cookie名 |
| callback | <code>string</code> | 是| 回调函数 |

其他接口根据运行环境中的httpFunction需要实现。