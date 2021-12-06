const express = require('express')
const app = express()
const path = require('path')
const fs = require('fs')
const nodeWatch = require('node-watch')
const compiler = require('../compiler/index')
const process = require('process')
const child_process = require('child_process')
const config = require('../configs/config')
const createWss = require('./wsServe')
const openBrowser = require('./utils/openBrowser')

const server = app.listen(config.port, () => {
    console.log(`-- serve is starting on localhost:${config.port} ---`)
})

const wss = createWss(server)

// 用于访问打包后的文件目录
app.use(express.static(path.join(__dirname, '../dist')))

// 用于访问页面用到的js等文件
app.use('/static', express.static(path.join(__dirname, './static')))


// 初次编译
compiler()
// 初次编译后是否打开浏览器浏览页面
if(config.openBrowser) {
    openBrowser(`http://localhost:${config.port}/`)
}

// 监听pages文件夹下文件内容是否改变
nodeWatch(path.join(__dirname, '../pages'),{recursive: true}, (eventType, fileName) => {
    console.log('---node watch pages----')

    // 有更改后重新编译该文件
    compiler(fileName)

    // 编译完以后发送消息给页面进行刷新
    wss.clients.forEach((client) => {
        client.send(JSON.stringify({type:'reload', data: fileName}))
    })

    global.wsClients.home.forEach((client) => {
        client.send('---this is to home----')
    })

})


// mock数据
app.use('/mock/*', (req, res) => {
    const mockUrls = req.originalUrl.split('/')
    res.send(require(`../mock/${mockUrls[2]}`)['/'+mockUrls.slice(3).join()] || {status: 'error', message: 'not found'})
})

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

app.get('/pageInfo', (req, res) => {
    res.send({
        status: 200,
        data: {
            title: '日媒：岸田文雄与欧洲理事会主席米歇尔通话，还扯起了所谓“中国动向”',
            subTitle: '【环球网报道】共同社消息',
            content: '【环球网报道】共同社消息，日本首相岸田文雄29日与欧洲理事会主席米歇尔进行了约20分钟的电话会谈，双方一致同意为实现所谓“自由开放的印度太平洋”切实推进合作。米歇尔原计划访问日本并于当天在东京与岸田举行会谈，但鉴于欧洲等地新冠疫情扩大而推迟访日。'    
        }
       })
})

app.get('/', (req, res) => {
    res.redirect('/home/index.html')
})

