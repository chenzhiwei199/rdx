import  { MsgType} from './msgType'


window.addEventListener('unload', () => {
    console.log("页面移除拉")
    chrome.runtime.sendMessage({ type: MsgType.Refresh});
})

// 监听页面发起的__EASYCANVAS_BRIDGE_TOPANEL__事件，一般用于选择元素时
document.addEventListener('__EASYCANVAS_BRIDGE_TOPANEL__', function(recieveData: CustomEvent){
    console.log("content_script 接受到消息啦", recieveData)
    if (!recieveData.detail) {
        return;
    } else {
        chrome.runtime.sendMessage({ type: MsgType.Data, message: recieveData.detail});
    }
	
});


