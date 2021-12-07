const express = require('express')
const app = express()
const path = require('path')
const fs = require('fs')
const chalk = require('chalk')
const nodeWatch = require('node-watch')
const compiler = require('../compiler/index')
const config = require('../configs/config')
const dealPath = require('./utils/dealPath')



// 用于访问打包后的文件目录
app.use(express.static(path.join(__dirname, '../dist')))

// 用于访问页面用到的js等文件
app.use('/static', express.static(path.join(__dirname, './static')))

// 启动服务
const server = app.listen(config.port, () => {
    console.log(chalk.cyan(`--- serve is starting on localhost:${config.port} ---`))
})

if(config.mode === 'development') {

    // 启动websocket服务
    const createWss = require('./ws-server/wsServe')
    createWss(server)

    // 监听pages文件夹下文件内容是否改变
    nodeWatch(path.join(__dirname, '../pages'),{recursive: true}, (eventType, fileName) => {
        // console.log('---node watch pages----')
        // console.log(fileName)

        // 有更改后重新编译该文件
        compiler(fileName)

        // 编译完以后发送消息给页面进行刷新
        // uid就是页面的名称
        const uid = dealPath.findCurPage(fileName)

        // console.log('change file : '+fileName)
        // console.log('---uid--', uid, global.wsClients)
        
        if(global.wsClients.hasOwnProperty(uid) && global.wsClients[uid].length) {
            global.wsClients[uid].forEach((client) => {
                client.send(JSON.stringify({type:'reload', data: fileName}))
            })    
        }
    })
}


// 初次编译
compiler()

// 初次编译后是否打开浏览器浏览页面
if(config.openBrowser) {
    const openBrowser = require('./utils/openBrowser')
    openBrowser(`http://localhost:${config.port}/`)
}


// 为了方便测试用的服务接口
app.get('/list', (req, res) => {
    res.send({
        status: 200,
        data: [
            {label: 'bbbbbbb', value: 'lsfdsfjdklsfds'},
            {label: 'bbbbbbb', value: 'lsfdsfjdklsfds'},
            {label: 'bbbbbbb', value: 'lsfdsfjdklsfds'},
            {label: 'bbbbbbb', value: 'lsfdsfjdklsfds'},
            {label: 'bbbbbbb', value: 'lsfdsfjdklsfds'},
        ]
    })
})
// 为了方便测试用的服务接口
app.get('/pageInfo', (req, res) => {
    res.send({
        status: 200,
        data: {
            pageTitle: 'page1',
            title: '日媒：岸田文雄与欧洲理事会主席米歇尔通话，还扯起了所谓“中国动向”',
            subTitle: '【环球网报道】共同社消息',
            publishTime: '2020-12-12 14:22:12',
            content: '【环球网报道】共同社消息，日本首相岸田文雄29日与欧洲理事会主席米歇尔进行了约20分钟的电话会谈，双方一致同意为实现所谓“自由开放的印度太平洋”切实推进合作。米歇尔原计划访问日本并于当天在东京与岸田举行会谈，但鉴于欧洲等地新冠疫情扩大而推迟访日。'    
        }
    })
})


// 用于mock数据
app.use('/mock/*', (req, res) => {
    const mockUrls = req.originalUrl.split('/')
    res.send(require(`../mock/${mockUrls[2]}`)['/'+mockUrls.slice(3).join()] || {status: 'error', message: 'not found'})
})

// 用于服务端渲染
app.get('*/server', async (req, res) => {

    const dir = path.join(__dirname, '../pages')
    const dirFiles = fs.readdirSync(dir)
    let allDirs = []
    dirFiles.forEach((item) => {
        if(fs.statSync(path.join(dir, item)).isDirectory()) {
            allDirs.push(item)
        }
    })

    const url = req.originalUrl.split('/')
    if(url.length === 3 && allDirs.includes(url[1]) && url[2] === 'server') {
        try{
            const renderJs = require(`../dist/${url[1]}/server.js`)
            const html = await renderJs()
            res.send(html)
        }catch(err) {
            console.log(err)
            res.send(err.toString())
        }
    }

})

app.get('/', (req, res) => {
    res.redirect('/home/index.html')
})

