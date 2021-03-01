const {desktopCapturer, ipcRenderer} = require('electron');//获取桌面流的信息
const EventEmitter = require('events');
const peer = new EventEmitter();
const video = document.getElementById('screen-video');

function play(stream) {
    video.srcObject = stream;
    video.onloadedmetadata = () => video.play()
}

// function getScreenStream(){//获取屏幕的信息
这个相关的代码在被控制端里
//}
// getScreenStream()

window.onkeydown = function (e) {
//...
}

window.onmouseup = function (e) {
//...
}


//先注释掉这些代码
//   peer.on('robot',(type,data)=>{
//     if(type === 'mouse'){
//       data.screen={
//         width:window.screen.width,
//         height:window.screen.height
//       }
//     }
//     setTimeout(() => {
//       ipcRenderer.send('robot',type,data)
//     }, 2000);
// })


//创建一个远程连接
const pc = new window.RTCPeerConnection({})

async function createOffer() {//创造一个远程端点
    const offer = await pc.createOffer({//只需要视频
        offerToReceiveAudio: false,
        offerToReceiveVideo: true,
    })
    await pc.setLocalDescription(offer);
    console.log('pc offer', JSON.stringify(offer))
    return pc.localDescription
}

createOffer();

async function setRemote(answer) {//设置远程SDP
    await pc.setRemoteDescription(answer)
}

window.setRemote = setRemote;//为了在控制台的能看看到效果
pc.onaddstream = function (e) {//监听媒体流的增加
    console.log('add-stream', e)
    peer.emit('add-stream', e.stream)
}
