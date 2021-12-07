# template-render 模板渲染框架

## 创建项目
> 使用 create-template-render 脚手架工具
```
使用方法：

    npx create-template-render  projectname(项目名称)

    创建成功后执行以下命令启动服务：

    cd projectname
    npm start 
        
```

## 访问页面
> 页面访问方法

    客户端渲染访问方式： http://localhost:端口号/pages下的页面名称/index.html
    服务端渲染访问方式： http://localhost:端口号/pages下的页面名称/server

    例子：
        http://localhost:3333/home/index.html
        http://localhost:3333/home/server


## 项目配置
> 项目配置文件路径：/configs/config.js 

### 配置文件各字段解释
---
#### **port: number**
服务启动端口，默认是 3333


#### **mode: string**
运行模式，值有： development 和 production 
development: 开发环境，pages文件夹中文件更改后会刷新浏览器
production： 生产环境

#### **domain: string**
后台服务地址

#### **openBrowser: boolean**
启动服务后是否打开默认浏览器, true：打开， false：不打开

#### **mock: boolean**
是否使用mock数据，true: 使用， false: 不使用
如果启用，默认所有的请求都会使用mock目录下的对应js里的内容
mock目录中js文件和pages目录下页面文件夹一一对应，例如：pages/home文件夹中发出的请求，都会对应到mock/home.js中

#### **templateEngine: object**
指定使用的基础模板引擎

    object: {
        name: string, 指定/server/static/template-engine目录下所使用的基础模板引擎xxx.js文件
        render: string  指定/server/static/template-engine目录下所使用的模板引擎的xxx-render.js文件
    }

该模板渲染工具是由基础模板引擎templateEngine和一些特殊语法一起使用的，该工具会将特殊语法处理，保留基础模板引擎语法，所以基础模板引擎可以由用户指定。

所有基础模板引擎都在 /server/static/template-engine 目录下，以文件夹区分，每个文件夹下都会包含两个文件：模板引擎xxx.js文件和使用该模板引擎的xxx-render.js文件。

xxx-render.js文件中,该工具会提供给使用该模板引擎所需的 template（模板语法内容）和 data（模板数据）两个值，具体请参考 /server/static/template-engine/handlebars 示例。 该工具默认使用[handlebars模版引擎](https://www.handlebarsjs.cn/)


#### **plugins: object[]**
    object: {
        test: string,    指定文件后缀名，对该类型的文件执行plugin编译
        plugin: string,  指定要使用的编译插件， 即compiler/gulpPlugins目录下的js文件
    }
文件内容的编译基于 gulp，所有plugin都需要符合[gulp规范](https://www.gulpjs.com.cn/)
用于扩展编译具体书写方法请参考/compiler/gulpPlugins文件夹下的案例


### config.js配置示例
---
```
module.exports = {
    "port": 3333, // 服务端口,默认 3333
    "mode": "development", // 运行模式 development | production
    "domain": "", // 后台服务地址
    "openBrowser": false, // 启动服务后是否打开默认浏览器 true | false
    "mock": true, // 是否使用mock数据 true | false
    "templateEngine": { // 指定使用的基础模板引擎
        "name": "handlebars/handlebars.js", // 指定 server/static/template-engine 目录下模板引擎文件
        "render": "handlebars/handlebars-render.js"  // 模板引擎的处理模板和数据的方法
    },
    "plugins": [
       {
           test: 'js', // 对于js后缀的文件执行以下plugin处理
           plugin: 'babelPlugin.js'
       },
       {
            test: 'ts',
            plugin: 'tsPlugin.js'
        },
       {
           test: 'scss',
           plugin: 'sassPlugin.js'
       }
    ]
}

```


## 页面开发
> 页面路径 /pages

    pages文件夹中，页面是以文件夹进行区分，每个文件夹就是单个页面，并且包含页面用到的所有js，css，images等

    页面的入口是 index.html ，所以每个页面文件夹中必须有index.html 文件, 并且跟index.html同级不得存在server.js

    页面文件夹的目录结构：
    index.html
    js
    css
    images
    ...

    当配置文件中mode是development模式时，修改pages下的内容后就会刷新浏览器页面

## 输出
> 输出路径 /dist
    
    输出目录中会包含跟pages目录一样的结构，并且每个页面的根目录中会有一个server.js文件，这个文件是用来做服务端渲染的
