const {app} = require('electron');
const {create: createMainWindow, show: showMainWindow, close: closeMainWindow} = require('./windows/main')//创建一个主窗口
// const {create: createControlWindow} = require('./windows/control')//控制窗口渲染页面
const handleIPC = require('./ipc')//处理主进程的事务放在同一个文件
const robot = require('./robot');

const gotTheLock = app.requestSingleInstanceLock();//是否有别的进展
if (!gotTheLock) {
    app.quit()
} else {
    app.on('second-instance', () => {//当运行第二个实例的时候，就会开始主要窗口
        showMainWindow()
    })
}

app.allowRendererProcessReuse = false;//为了防止原生模块在渲染进程中被覆盖

process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true';

app.on('ready', () => {
    handleIPC()
    createMainWindow()//主窗口出现APP.js的页面
    // createControlWindow()
    robot()
})

app.on('before-quit',()=>{//所有窗口触发close之后，才会触发before-quit并关闭所有窗口。
    closeMainWindow()
})
