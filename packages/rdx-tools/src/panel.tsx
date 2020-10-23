import React from 'react';
import { createContext, useState } from 'react';
import { render } from 'react-dom';
import TableViewer from './visualState/TableViewer';
import { MsgType } from './msgType';

export interface IDataPersistenData {
  realTimeState: any;
  allSnapShots: any[];
}
export const DataPersistence = createContext<IDataPersistenData>(null);
let data = {
  allSnapShots: [],
  realTimeState: {},
}; 
console.log("panel 渲染啦");
(window as any).getState = () => {
    return JSON.parse(JSON.stringify(data))
}
(window as any).setState = (value: { type: string; message: any }) => {
  const { type, message} = value
  if (type === MsgType.Data) {
    data = ({
      ...data,
      allSnapShots: data.allSnapShots.concat([message]),
    });
  } else if(type === MsgType.Refresh) {
    data = ({
      ...data,
      allSnapShots: [],
    });
  } else if(type === MsgType.loadCachePanelData) {
    data =  message
  }
  // document.documentElement.innerText = JSON.stringify(data);
  (window as any)._setState && (window as any)._setState(data)
}

const App = () => {
  const [state, _setState] = useState({
    allSnapShots: [],
    realTimeState: {},
  });
  (window as any)._setState = _setState
  return (
    <div>
      <DataPersistence.Provider value={state}>
        <TableViewer />
      </DataPersistence.Provider>
    </div>
  );
};

render(<App />, document.getElementById('react-root'));

