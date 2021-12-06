const WebSocket = require('ws')
const config = require('../configs/config')

function createWss(server) {
    console.log('--server--', server)

    const wss = new WebSocket.WebSocketServer({server})

    wss.on('connection', function (ws, req) {
        console.log('---connnect---', )
        // console.log(req)
        // console.log(req.url)
        // console.log(req.headers)
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
