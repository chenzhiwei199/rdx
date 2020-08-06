import React from 'react';
import { useRef } from 'react';
import { useForceUpdate } from '@czwcode/rdx-next-form';
export default {
  title: '基本示例/contextTest',
  parameters: {
    info: { inline: true },
  },
};

function xxx<T>(a: T):  T {
  return a
}
const ShareContextInstance = React.createContext({ a: 1 });
const Child = ({ v }) => {
  return (
    <ShareContextInstance.Consumer>
      {(context) => {
        return (
          <div
            onClick={() => {
              // context.setA(v);
            }}
          >
            3333
          </div>
        );
      }}
    </ShareContextInstance.Consumer>
  );
};

class T {
  onChange: any;
  constructor(onChange) {
    this.onChange = onChange;
  }
  a: 1;
  b: 777
  setA(a) {
    this.a = a;
    this.onChange();
  }
}
const Parent = ({ children }) => {
  const forceUpdate = useForceUpdate();
  const ref = useRef(new T(forceUpdate));
  
  return (
    <ShareContextInstance.Provider value={ref.current}>
      <div> parent ----{JSON.stringify(ref.current)}</div>
      {children}
    </ShareContextInstance.Provider>
  );
};
export const TTTT = () => {
  return (
    <div>
      <Parent>
        <Child v={2}></Child>
        <Parent>
          <Child v={3}></Child>
        </Parent>
      </Parent>
    </div>
  );
};
