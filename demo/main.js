const { app, BrowserWindow, ipcMain, Notification } = require('electron');
let mainWindow = null;

app.on('ready', () => {
    mainWindow = new BrowserWindow({    // 创建和控制浏览器窗口
        width: 600,                     // 窗口宽度
        height: 600,                    // 窗口高度
        webPreferences: {               // 网页功能设置
            nodeIntegration: true,      // 是否在node工作器中启用工作集成默认false
            enableRemoteModule: true,   // 是否启用remote模块默认false
        }
    });
    require('./menu');//引进menu
    const notification = new Notification({
        title:"提示",
        body:'嘻嘻',
        action:[{
            text:'确定'
        }]
    })
    ipcMain.on('debug', (event, arg) => {
        console.log(arg) // prints "ping"
        event.sender.send('asynchronous-reply', 'pong')
    })
    ipcMain.handle('debugShow',()=>{
        mainWindow.webContents.openDevTools() //打开控制台
        process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true';//消除控制台上报警文字
    })
    mainWindow.loadFile('index.html');  // 加载页面
    mainWindow.on('close', () => {      // 监听窗口关闭
        mainWindow = null               //销毁mainWindow
    })

})
