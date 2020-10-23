import { MsgType } from './msgType';

chrome.devtools.panels.create(
  'RdxDevtools',
  'icon.png',
  'panel.html',
  function (extensionPanel) {
    var _window; // Going to hold the reference to panel.html's `window`
    chrome.devtools.inspectedWindow.eval(`console.log( 'Panel created')`);
  
    var port = chrome.runtime.connect({ name: 'devtools' });
    window.onbeforeunload = () => {
      chrome.devtools.inspectedWindow.eval(`console.log( 'onunload', ${JSON.stringify(port)})`);
      port.postMessage({
        type: MsgType.onDevtoolUnload,
        tabId: chrome.devtools.inspectedWindow.tabId,
        data: _window && _window.getState()
      })
    };
    // 注册接受某个web page的消息
    // function sendMsgToPanel() {
    //   if (_window && _window.setState) {
    //     let msg;
    //     while ((msg = data.shift())) {
          
    //     }
    //   }
    //   // // 记录devtool当前的loa状态
    //   // if (_window && _window.getState) {
    //   //   port.postMessage({
    //   //     name: MsgType.savePanelData,
    //   //     tabId: chrome.devtools.inspectedWindow.tabId,
    //   //     data: _window.getState(),
    //   //   });
    //   // } else {
    //   //   const findIndex = data
    //   //     .reverse()
    //   //     .findIndex((item) => item.type === MsgType.Refresh);
    //   //   port.postMessage({
    //   //     name: MsgType.saveMessage,
    //   //     tabId: chrome.devtools.inspectedWindow.tabId,
    //   //     data: findIndex === -1 ? data : data.slice(data.length - 1),
    //   //   });
    //   // }
    // }

    port.onMessage.addListener( (msg) => {
      chrome.devtools.inspectedWindow.eval(`console.log( 'devtool接受到消息啦', ${JSON.stringify(msg)})`);
      _window.setState && _window.setState(msg);
    });
    port.postMessage({
      type: MsgType.devtoolBind,
      tabId: chrome.devtools.inspectedWindow.tabId,
    });
    extensionPanel.onShown.addListener(function tmp(panelWindow: any) {
      extensionPanel.onShown.removeListener(tmp); // Run once only
      _window = panelWindow;
      port.postMessage({
        type: MsgType.onPanelShown,
        tabId: chrome.devtools.inspectedWindow.tabId
      });
    });
  }
);

