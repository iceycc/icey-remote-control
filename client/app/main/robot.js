// robotjs只能在主进程中运行，所以robotjs代码在主进程通过ipc的方法，让渲染进程调用主进程去做软件控制(键盘和鼠标)

const {ipcMain}=require('electron');
const robot=require('robotjs')
const vkey=require('vkey')

function handleMouse(data){
    //传过来的数据：data:{clientX,clientY,screen:{width,height},video:{width,height}}
    let {clientX,clientY,screen,video} =data
    let x=clientX*screen.width/video.width;
    let y=clientY*screen.height/video.height;
    robot.moveMouse(x,y)
    robot.mouseClick()
    console.log("mouse",data)
}


function handleKey(data){
    //传过来的数据：data:{keyCode,meta,alt,ctrl,shift}
    const modifiers=[];//修饰键
    if(data.meta) modifiers.push('meta')
    if(data.shift) modifiers.push('shift')
    if(data.alt) modifiers.push('alt')
    if(data.ctrl) modifiers.push('ctrl')
    let key=vkey[data.keyCode].toLowerCase()//拿到对应的键值
    if(key[0] !== '<'){//排除<shift>特殊字符
        robot.keyTap(key,modifiers)
    }
    console.log('key',data)
}

module.exports=function(){
    ipcMain.on('robot',(e,type,data)=>{//*******通信**主进程
        //判断事件类型
        if(type === 'mouse'){//鼠标类型
            handleMouse(data)
        }else if(type === 'key'){//键盘类型
            handleKey(data)
        }
    })
}
