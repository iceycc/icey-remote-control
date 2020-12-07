const {BrowserWindow}=require('electron');
const isDev=require('electron-is-dev');//判断是生产环境还是开发环境
const path=require('path')
let win,winAll=false;
function create(){
    win=new BrowserWindow({//创建一个窗口
        width:600,
        height:600,
        webPreferences:{//可以使用node相关的
            nodeIntegration:true
        }
    })

    win.on('close',(e)=>{
        if(winAll){//是否是真正退出
            win=null
        }else{
            e.preventDefault()//禁止窗口的关闭
            win.hide()//窗口隐藏
        }
    });

    // if(isDev){
    //     win.loadURL('http://localhost:3000')
    // }else{
        win.loadFile(path.resolve(__dirname,"../../renderer/pages/main/index.html"))
    // }
}
function send(channel,...args){//接收信息
    win.webContents.send(channel,...args)
}

function show(){
    win.show()
}
function close(){
    winAll=true;//应用真正关闭
    win.close()
}

module.exports={create,send,close,show};
