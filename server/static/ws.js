function findCurPage(filePath, type) {
    const paths = filePath.split('/')
    return paths[paths.length - 2] || ''

}
const pathname = findCurPage(window.location.pathname)
const reg = new RegExp('/'+pathname+'/')
const ws = new WebSocket('ws://localhost:3333/'+pathname)


ws.onerror = function(e) {
    console.log('websocket error')
    console.log(e)
}

ws.onopen = function(e) {
    console.log('websocket is connected')
    console.log(e)
}

ws.onclose = function(e) {
    console.log('websocket is closed')
    console.log(e)
}

ws.onmessage = function(e) {
    console.log('websocket received message')
    console.log(e)
    const message = JSON.parse(e.data)
   
    switch(message.type) {
        case 'heart':
            heart()(ws)
            break;
        case 'reload':
            if(reg.test(message.data)) {
                window.location.reload()
            }
            break;
        default:
            break;
    }
}

function heart() {
    let timer = null

    return function(ws) {
        if(!timer) {
            timer = setTimeout(() => {
                timer = null
                ws.send('ping')
            }, 30000)
        }  
    }
   
}

