const WebSocket = require('ws')
const config = require('../configs/config')

// 存储已连接用户
global.wsClients = {}

function createWss(server) {
    console.log('--server--', server)

    const wss = new WebSocket.WebSocketServer({server})

    wss.on('connection', function (ws, req) {
        console.log('---connnect---', )
        const uid = req.url.substring(1,)
        if(global.wsClients.hasOwnProperty(uid)) {
            if(!(global.wsClients[uid].includes(ws))) {
                global.wsClients[uid].push(ws)
            }
        }else {
            global.wsClients[uid] = [ws]
        }

        console.log(global.wsClients)


        if(req.headers.origin !== `http://localhost:${config.port}`) {
            ws.terminate()
            return 
        }
        ws.on('message', function (data) {
            if(data.toString() === 'ping') {
                ws.send(JSON.stringify({type: 'heart'}))
            }
        })
        ws.send(JSON.stringify({type: 'heart'}))

      
    })

    return wss
}

module.exports = createWss
