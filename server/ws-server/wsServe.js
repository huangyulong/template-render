const WebSocket = require('ws')
const config = require('../../configs/config')

// 定义全局对象，用于存储websocket连接用户
global.wsClients = {}

// 进行断开检测，有断开的连接从wsclients中进行删除
let checkClients = setInterval(() => {
    if(!(Object.keys(global.wsClients))) { return }

    // 遍历所有连接，发现断开的进行删除
    Object.keys(global.wsClients).forEach((key) => {
        for(let i = 0, len = global.wsClients[key].length; i < len; i++) {
            // console.log('--one wsclients---',key, global.wsClients[key].length,  i,  global.wsClients[key][i].isAlive)
            if(!(global.wsClients[key][i].isAlive)) {
                
                global.wsClients[key][i].terminate()
                global.wsClients[key].splice(i,1)
                --i;
                --len; 

                // 如果某个页面已经没有连接了，清理掉这个页面的key
                if(len === 0) {
                    delete global.wsClients[key]
                    console.log('delete key:  '+key)
                    break
                }

                continue
            }

            // 发ping检测前，将该ws的isAlive置为false
            global.wsClients[key][i].isAlive = false
            // 发出ping后，如果连接还在，那么会出发该ws绑定的pong函数，也就是heart函数，将isAlive置为true
            global.wsClients[key][i].ping()
        }
    })
}, 30000);

// 用户将ws连接设置为连接状态
function heart(){
    this.isAlive = true
}


// 创建服务端websocket连接，并与node服务共用同一个端口
function createWss(server) {
    const wss = new WebSocket.Server({server})

    wss.on('connection', function(ws, request) {
       
        // console.log('connect from: ', request.headers.origin)
    
        // 判断当前域名是否可以进行连接，不允许的话拒绝连接
        if(request.headers.origin !== `http://localhost:${config.port}`) {
            ws.terminate()
            return 
        }
    
        // 用来判断该client连接是否已经关闭，ws.ping()函数执行后如果客户端还在连接状态会调用ws.on('pong', heart)
        ws['isAlive'] = true
        ws.on('pong', heart)
    
        // 连接的用户以页面的名字为key存储到wsClients对象中，值为ws数组（一个页面可能会有多个连接，比如打开多个浏览器）
        const uid = request.url.substring(1,)
        // console.log(`client connected : ${uid}`)

        if(global.wsClients.hasOwnProperty(uid)) {
            if(!(global.wsClients[uid].includes(ws))) {
                global.wsClients[uid].push(ws)
            }
        }else {
            global.wsClients[uid] = [ws]
        }
    
        ws.on('message', function(data){
            // console.log('--ws.onmessage---', data.toString())

            // 接收到的ping消息后，发送连接者heart
            if(data.toString() === 'ping') {
                ws.send(JSON.stringify({type: 'heart'}))
            }

        })
    })
    
    wss.on('close', function(){
        console.log('----close---')
        // websocket服务断开后清除断开检测定时器
        clearInterval(checkClients)
    })
    
}

module.exports = createWss



