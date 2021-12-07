
let ws = null
let uid = ''
let reg = null

// 心跳检测以及重连
const heartAndRetry = {
    timeout: 25000, // 25秒检测一次
    timer: null,
    serverTimer: null,
    canRetry: true,
    retryTimeout: 10000, // 断开后10秒重连
    retryTimer: null,
    maxRetryLen: 5, // 对多重连次数
    retryLen: 0, // 当前连接过的次数
    // 重连函数
    reconnect: function(connect) {
        console.log('--reconnect--', this.canRetry)
        if(this.canRetry) {
            this.canRetry = false
            clearTimeout(this.retryTimer)
            this.retryTimer = setTimeout(() => {
                console.log('--retry--connect-')
                connect()
                this.retryTimer = null

                this.retryLen += 1
                if(this.retryLen === this.maxRetryLen) {
                    this.canRetry = false
                }else {
                    this.canRetry = true
                }
            }, this.timeout)
        }else {
            return
        }
    },
    // 重置心跳检测
    reset: function() {
        console.log('-heart-reset---')
        clearTimeout(this.timer)
        clearTimeout(this.serverTimer)
        this.timer = null
        this.serverTimer = null
        return this
    },
    // 开始心跳检测
    start: function(ws) {
        console.log('-heart-start---')
        clearTimeout(this.timer)
        clearTimeout(this.serverTimer)

        this.timer = setTimeout(() => {
            ws.send('ping')

            this.serverTimer = setTimeout(() => {
                console.log('--长时间没有得到后台的响应，关闭websocket连接--')
                ws.close()
            }, this.timeout)
            
        }, this.timeout)
    }
}

// 创建websocket连接
const createWs = () => {
    try {
        ws = new WebSocket(`ws://${window.location.host}/${uid}`)
        init()
    }catch(err) {
        console.log('---new WebSocket error---')
        console.log(err)
        // 连接失败后进行重连
        heartAndRetry.reconnect(createWs)
    }
}

// 连接成功后初始化相关事件
const init = () => {

    ws.onopen = function() {
        console.log('---home connect---')
        ws.send('ping')
        heartAndRetry.retryLen = 0
    }
    
    ws.onmessage = function(e) {
        console.log('message ---', e.data)
        const message = JSON.parse(e.data)
        switch(message.type) {
            // 接收到心跳检测信息
            case 'heart':
                heartAndRetry.reset().start(ws)
                break;
            // 接收到页面刷新信息
            case 'reload':
                if(reg.test(message.data)) {
                    window.location.reload()
                }
                break;
            default:
                break;
        }
       
    }

    ws.onerror = function(err){
        console.log('--ws error--', err)
        // websocket出错后进行重连
        heartAndRetry.reconnect(createWs)
    }

    ws.onclose = function(e){
        console.log('--ws closed--',e)
        ws.send('---close---')
        // 关闭后进行重连
        heartAndRetry.reset()
        heartAndRetry.reconnect(createWs)
        
    }
    
    
}


const regPathname = /\/([\w+-_]+)\//.exec(window.location.pathname)

if(regPathname) {
    uid = regPathname[1]
    reg = new RegExp(`/${uid}/`)
    createWs()
}
