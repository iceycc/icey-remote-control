const fs = require('fs');
const {remote, ipcRenderer} = require('electron') // remote
const btn = this.document.querySelector('#btn');
const food = this.document.querySelector('#food');
const {BrowserWindow, Menu, getCurrentWindow, ipcMain} = remote
const rightTemplate = [
    {label: '粘贴'},
    {label: '复制'},
    {
        label: '调试', click: () => {
            ipcRenderer.invoke('debugShow').then(res=>{
                console.log('res')
            })
        }
    }
]
const menu = Menu.buildFromTemplate(rightTemplate)
window.addEventListener('contextmenu', (e) => {
    // 阻止当前窗口默认事件
    e.preventDefault();
    //把菜单模板添加到右键菜单
    menu.popup({window: remote.getCurrentWindow()})
}, false)
window.onload = () => {
    btn.onclick = () => {
        fs.readFile('food.txt', (err, data) => {
            food.innerHTML = data
        })
        let newWin = new BrowserWindow({
            width: 500,
            height: 500
        })
        newWin.loadFile('red.html')
        newWin.on('close', () => newWin = null)
    }
}
