const {ipcMain} = require('electron');//主进程
const {send: sendMainWindow} = require('./windows/main')//向主窗口发送信息
const {create: createControlWindow,send: sendControlWindow} = require('./windows/control')//创建新的窗口
const signal = require('./signal')

module.exports = function () {
    ipcMain.handle('login', async () => {//主进程响应login
        //先mock，返回一个code
        // let code = Math.floor(Math.random() * (999999 - 100000)) + 100000;
        let {code}=await signal.invoke('login',null,'logined')
        console.log("login--data",code)
        return code;
    })
    ipcMain.on('control', async (e, remote) => {
        //这里跟服务端交互，但是mock返回
        // sendMainWindow('control-state-change', remote, 1);
        // createControlWindow()
        signal.send('control', {remote})
    })
    signal.on('controlled', (data) => {//控制端
        createControlWindow()
        sendMainWindow('control-state-change', data.remote, 1)
    })
    signal.on('be-controlled', (data) => {//被控制端
        sendMainWindow('control-state-change', data.remote, 2)
    })
    ipcMain.on('forward', (e, event, data) => {//响应forward事件转发信令
        signal.send('forward', {event, data})
    })
    signal.on('offer', (data) => {//发送给主窗口
        sendMainWindow('offer', data)
    })
    signal.on('answer', (data) => {//发送给控制窗口
        sendControlWindow('answer', data)
    })
    signal.on('puppet-candidate', (data) => {//发送给控制端
        sendControlWindow('candidate', data)
    })
    signal.on('control-candidate', (data) => {//发送给被控制端
        sendMainWindow('candidate', data)
    })
}
