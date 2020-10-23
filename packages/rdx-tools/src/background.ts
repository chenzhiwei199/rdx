import { MsgType } from './msgType';

// 作为content script 与 devtool 通信的桥
const connections = {};

// 缓存页面数据
// 考虑关闭之后的持久化
const messageCache = new Map<number, any[]>();
const devtoolDataCache = new Map<number, any>();
let isPanelShown = false;
chrome.runtime.onConnect.addListener(function (port) {
  const extensionListener = function (message, sender, sendResponse) {
    chrome.tabs.executeScript({
      code: `console.log("${message.type}--------------------------------------------${message.tabId}")`,
    });
    switch (message.type) {
      case MsgType.devtoolBind:
        connections[message.tabId] = port;
        break;
      case MsgType.onPanelShown:
        isPanelShown = true;
        chrome.tabs.executeScript({
          code: `console.log(${JSON.stringify(
            messageCache.get(message.tabId)
          )})`,
        });
        postMesasge(message.tabId);
        break;
      case MsgType.onPanelHidden:
        isPanelShown = false;
        break;
      case MsgType.onDevtoolUnload:
        devtoolDataCache.set(
          message.tabId,
          JSON.parse(JSON.stringify(message.data))
        );
      default:
        break;
    }
  };
  port.onMessage.addListener(extensionListener as any);

  port.onDisconnect.addListener((port) => {
    const tabs = Object.keys(connections);
    port.onMessage.removeListener(extensionListener as any);
    for (let i = 0, len = tabs.length; i < len; i++) {
      if (connections[tabs[i]] == port) {connections
        delete connections[tabs[i]];
        break;
      }
    }
  });
});

function postMesasge(tabId: number) {
  if (tabId in connections) {
    //  如果devtool数据有缓存，则先恢复再传输数据
    if (isPanelShown) {
      if (devtoolDataCache.has(tabId)) {
        connections[tabId].postMessage({
          type: MsgType.loadCachePanelData,
          message: devtoolDataCache.get(tabId),
        });
        devtoolDataCache.delete(tabId)
      }
      let data = messageCache.get(tabId) || [];
      chrome.tabs.executeScript({
        code: `console.log("---------------------------------------------------")`,
      });
      chrome.tabs.executeScript({
        code: `console.log("缓存的消息", ${JSON.stringify(data)})`,
      });
      let msg;
      while ((msg = data.shift())) {
        connections[tabId].postMessage(msg);
      }
      messageCache.set(tabId, []);
    }
  } else {
    
    console.log('Tab not found in connection list.');
  }
}

// 接收内容脚本的消息，并发送到devtool的消息
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // 判断当前页面是否存在easy-canvas，从而改变icon和popup
  if (sender.tab) {
    const tabId = sender.tab.id;
    messageCache.set(tabId, [...(messageCache.get(tabId) || []), message]);
    postMesasge(tabId);
  } else {
    console.log('sender.tab not defined.', sender);
  }
  return true;
});
