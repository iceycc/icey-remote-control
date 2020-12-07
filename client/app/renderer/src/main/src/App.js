import React, {useState, useEffect} from 'react';//使用hooks
import './controll';//被控制端的主要逻辑
const {ipcRenderer} = window.require('electron')//引入渲染进程
function App() {
    const [remoteCode, setRemoteCode] = useState('');//控制的控制码
    const [localCode, setLocalCode] = useState('');//本身的控制码
    const [controlText, setControlText] = useState('');//控制码的文案
    const login = async () => {
        //登录状态是在主进程维护，通过主进程来处理ipc事件
        let code = await ipcRenderer.invoke('login')
        console.log(setLocalCode(code))
        if (!code) {
            return setLocalCode(code)
        }//本身控制码重新赋值
    };
    useEffect(() => {
        login()
        ipcRenderer.on('control-state-change', handleControlState)//监听ipc事件，从主进程传过来的，说明现在的控制状态是否发生了改变
        return () => {
            //监听函数之后，最好清理掉这个函数(退出时)
            ipcRenderer.removeListener('control-state-change', handleControlState)
        }
    }, [])
    const startControl = (remoteCode) => {//发起一个请求，想去控制控制码对应的用户
        ipcRenderer.send('control', remoteCode)
    }
    const handleControlState = (e, name, type) => {//状态文案的改变
        let text = '';
        if (type === 1) {
            //控制别人
            text = `正在远程控制${name}`
        } else if (type === 2) {
            //被别人控制
            text = `被${name}控制`
        }
        setControlText(text)//当前页面的文本
    }
    return (
        <div className="App">
            {
                controlText === '' ? <>
                    <div>你的控制码{localCode}</div>
                    <input type="text" value={remoteCode} onChange={e => setRemoteCode(e.target.value)}/>
                    <button onClick={() => startControl(remoteCode)}>确认</button>
                </> : <div>{controlText}</div>
            }
        </div>
    );
}

export default App;
