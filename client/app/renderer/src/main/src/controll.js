//被控制端方面进行的回应，媒体流的监听

const {desktopCapturer, ipcRenderer} = window.require('electron')

function getScreenStream() {
    return new Promise((resolve, reject) => {
        desktopCapturer.getSources({types: ['window', 'screen']}).then(async sources => {
            console.log(sources)//获取的对象如图所示在下面
            for (const source of sources) {
                try {
                    const stream = await navigator.mediaDevices.getUserMedia({
                        audio: false,
                        video: {
                            mandatory: {
                                chromeMediaSource: 'desktop',
                                chromeMediaSourceId: source.id,
                                maxWidth: window.screen.width,
                                maxHeight: window.screen.height,
                            }
                        }
                    })
                    resolve(stream)
                } catch (reject) {
                    console.error(reject)
                }
            }
        })
    })
}

const pc = new window.RTCPeerConnection({});
// ele_指令传输
pc.ondatachannel = (e) => {//监听datachannel事件跟上文代码相呼应
    // console.log("datachannel",e)
    e.channel.onmessage = (e) => {
        const {type, data} = JSON.parse(e.data);//获取控制端robotjs数据
        if (type === 'mouse') {
            data.screen = {
                width: window.screen.width,
                height: window.screen.height
            }
        }
        ipcRenderer.send('robot', type, data)
    }
}

// --------
async function createAnswer(offer) {
    let screenStream = await getScreenStream()
    pc.addStream(screenStream);
    await pc.setRemoteDescription(offer);
    await pc.setLocalDescription(await pc.createAnswer())
    console.log("answer", JSON.stringify(pc.localDescription))
    return pc.localDescription
}

//window.createAnswer=createAnswer

pc.onicecandidate = function (e) {//触发此事件函数
    console.log('candidate-control', JSON.stringify(e.candidate))
    if (e.candidate) {//排除candiate为null的情况
        //渲染进程发送'forward'相关信息
        ipcRenderer.send('forward', 'puppet-candidate', JSON.stringify(e.candidate))
    }
}
ipcRenderer.on('candidate', (e, candidate) => {//渲染进程监听'candidate'
    addIceCandidate(candidate)
})
let candidates = [];//缓存的效果
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

window.addIceCandidate = addIceCandidate;

ipcRenderer.on('offer', async (e, offer) => {//渲染进程监听'offer'发送answer的结果
    let answer = await createAnswer(offer)
    ipcRenderer.send('forward', 'answer', {type: answer.type, sdp: answer.sdp})
})
