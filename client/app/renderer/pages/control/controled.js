const {desktopCapturer, ipcRenderer} = require('electron');//获取桌面流的信息
const EventEmitter = require('events');
const peer = new EventEmitter();
const video = document.getElementById('screen-video');

function play(stream) {
    video.srcObject = stream;
    video.onloadedmetadata = () => video.play()
}

peer.on('add-stream', (stream) => {
    play(stream);
})

// function getScreenStream() {//获取屏幕的信息
//     return new Promise((_resolve, _reject) => {//对视频音频进行约束条件
//         desktopCapturer.getSources({types: ['window', 'screen']}).then(async sources => {
//             console.log(sources)//获取的对象如图所示在下面
//             for (const source of sources) {
//                 try {
//                     const stream = await navigator.mediaDevices.getUserMedia({
//                         audio: false,
//                         video: {
//                             mandatory: {
//                                 chromeMediaSource: 'desktop',
//                                 chromeMediaSourceId: source.id,
//                                 maxWidth: window.screen.width,
//                                 maxHeight: window.screen.height,
//                             }
//                         }
//                     })
//                     play(stream)
//                 } catch (reject) {
//                     console.error(reject)
//                 }
//             }
//         })
//     })
// }

// getScreenStream().then(res => {
//     console.log(res)
// })//调用

window.onkeydown = function (e) {
    var data = {
        keyCode: e.keyCode,
        shift: e.shiftKey,
        meta: e.metaKey,
        control: e.controlKey,
        alt: e.altKey
    }
    peer.emit('robot', 'key', data)//返回一个键盘类型的事件的结果
}
window.onmouseup = function (e) {
    var data = {
        clientX: e.clientX,
        clientY: e.clientY,
        video: {
            width: video.getBoundingClientRect().width,
            height: video.getBoundingClientRect().height

        }
    }
    peer.emit('robot', 'mouse', data)////返回一个鼠标类型的事件的结果
}
// peer.on('robot', (type, data) => {
//     if (type === 'mouse') {
//         data.screen = {
//             width: window.screen.width,
//             height: window.screen.height
//         }
//     }
//     setTimeout(() => {
//         ipcRenderer.send('robot', type, data)//********通信**渲染进程
//     }, 2000);
// })

//创建一个远程连接
const pc = new window.RTCPeerConnection({})
// ele_指令传输
const dc = pc.createDataChannel('robotchannel', {reliable: false});//允许一定数据的丢失
dc.onopen = function () {
    peer.on('robot', function (type, data) {//监听robot事件发送数据
        dc.send(JSON.stringify({type, data}))
    })
}
dc.onmessage = function (e) {//接收到控制端的消息
    console.log('message', e)
}
dc.onerror = function (e) {//防止收到报错的消息
    console.log('error', e)
}

// ------
async function createOffer() {//创造一个远程端点
    const offer = await pc.createOffer({//只需要视频
        offerToReceiveAudio: false,
        offerToReceiveVideo: true,
    })
    await pc.setLocalDescription(offer);
    console.log('pc offer', JSON.stringify(offer))
    return pc.localDescription
}

createOffer().then(offer => {
    ipcRenderer.send('forward', 'offer', {type: offer.type, sdp: offer.sdp})
});

async function setRemote(answer) {//设置远程SDP
    console.log('setRemote', answer)
    await pc.setRemoteDescription(answer)
}

ipcRenderer.on('answer', (e, answer) => {//监听answer事件调用setRemote方法
    setRemote(answer)
})


window.setRemote = setRemote;//为了在控制台的能看看到效果
pc.onaddstream = function (e) {//监听媒体流的增加
    console.log('add-stream', e)
    peer.emit('add-stream', e.stream)
}
// ICE

pc.onicecandidate = function (e) {//触发此事件函数
    //console.log('candidate',JSON.stringify(e.candidate))
    if (e.candidate) {//排除candiate为null的情况
        //渲染进程发送'forward'相关的信息
        ipcRenderer.send('forward', 'control-candidate', JSON.stringify(e.candidate))
    }

}
ipcRenderer.on('candidate', (e, candidate) => {//渲染进程'candidate'
    addIceCandidate(candidate)//手动换成自动，触发addIceCandidate函数
})

let candidates = [];

async function addIceCandidate(candidate) {
    if (candidate) {//可能结果为null
        candidates.push(candidate);
    }
    if (pc.remoteDescription && pc.remoteDescription.type) {
        for (var i = 0; i < candidates.length; i++) {
            const candidate = JSON.parse(candidates[i])
            await pc.addIceCandidate(new RTCIceCandidate(candidate))
        }
        candidates = [];//清空数据
    }
}

window.addIceCandidate = addIceCandidate;//方便在控制台上操作 //要是没有bug的话可以去掉这行代码
