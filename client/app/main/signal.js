//相关的通信逻辑
const webSocket = require('ws');
const eventEmitter = require('events')
const signal = new eventEmitter()//与IPC做通信
// const isDev = require('electron-is-dev');//判断是生产环境还是开发环境
// const SIGNAL_HOST = isDev ? 'ws://127.0.0.1:8001' : 'ws://101.201.253.226:8001'
const SIGNAL_HOST = 'ws://101.201.253.226:8001'
const ws = new webSocket(SIGNAL_HOST)
ws.on('open', () => {
    console.log('connect success')
})
ws.on('message', (message) => {//响应消息
    let data = {};
    console.log('message123', message)
    try {
        data = JSON.parse(message)
    } catch (e) {
        console.log('parse error', e)
    }
    signal.emit(data.event, data.data)
})

function send(event, data) {//以字符串的形式送出去
    ws.send(JSON.stringify({event, data}))
}

function invoke(event, data, answerEvent) {
    //ipcMain调用invoke方法发送一个事件，等待事件返回之后给一个结果
    return new Promise((resolve, reject) => {
        send(event, data)
        signal.once(answerEvent, resolve)//监听接收的事件继续执行
        setTimeout(() => {
            reject('timeout')
        }, 50000)
    })
}

signal.send = send
signal.invoke = invoke
module.exports = signal
