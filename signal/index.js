const webSocket=require('ws');
const wss=new webSocket.Server({port:8001});

const code2ws=new Map()
wss.on('connection',function connection(ws,request){
//ws端
    //随机码  六位数
    let code=Math.floor(Math.random()*(999999-100000))+100000
    code2ws.set(code,ws);//形成一个映射
    ws.sendData=(event,data)=>{//封装数据成字符串格式
        ws.send(JSON.stringify({event,data}))
    }
    ws.sendError=msg=>{ws.sendData('error',{msg})}
    ws.on('message',function incoming(message){
        console.log('incoming',message);//传过来的数据类型是:{event,data}
        let parsedMessage={};
        try{
            //防止服务器会崩溃
            parsedMessage=JSON.parse(message)
        }catch(e){
            ws.sendError('message invalid')
            console.log('parse message error',e)
            return
        }
        let {event,data}=parsedMessage;//解构
        if(event === 'login'){
            ws.sendData('logined',{code})
        }else if(event === 'control'){
            let remote= +data.remote;//转换成数据类型
            if(code2ws.has(remote)){
                //数字和ws做一个映射，有的话说明已经成功控制用户了
                ws.sendData('controlled',{remote})
                //转发需求通过sendRemote去调用
                ws.sendRemote=code2ws.get(remote).sendData
                //被控制端发送消息给控制端
                code2ws.get(remote).sendData=ws.sendData
                //把被控制消息和code转发过去
                ws.sendRemote('be-controlled',{remote:code})
            }
        }else if(event === 'forward'){//实现信令转发需求
            // ws.sendRemote(data.event,data.data)
            ws.sendData(data.event,data.data)
        }
    })

    ws.on('close',()=>{
        //清理事件
        code2ws.delete(code)
        clearTimeout(ws._closeTimeout)
    })
    ws._closeTimeout=setTimeout(()=>{
        ws.terminate()//直接终止
    },10*60*1000)
})
