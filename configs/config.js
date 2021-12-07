module.exports = {
    "port": 3333, // 服务端口
    "mode": "development", // 运行模式 development | production
    "domain": "", // 后台服务地址
    "openBrowser": false, // 启动服务后是否打开默认浏览器 true | false
    "mock": true, // 是否使用mock数据 true | false
    "templateEngine": { // 指定使用的基础模板引擎
        "name": "handlebars/handlebars.js", // 指定 server/static/template-engine 目录下模板引擎文件
        "render": "handlebars/handlebars-render.js"  // 模板引擎的处理模板和数据的方法
    },
    // plugins：用于扩展编译方法，基于gulp，参考/compiler/gulpPlugins文件夹下的案例
    "plugins": [
    //    {
    //        test: 'js', // 对于js后缀的文件执行以下plugin处理
    //        plugin: 'babelPlugin.js'
    //    },
    //    {
    //         test: 'ts',
    //         plugin: 'tsPlugin.js'
    //     },
    //    {
    //        test: 'scss',
    //        plugin: 'sassPlugin.js'
    //    }
    ]
}
