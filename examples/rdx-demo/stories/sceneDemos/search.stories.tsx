import React, { useState, useRef } from 'react';
import { Input, Select } from '@alifd/next';
export default {
  title: '场景专题/搜索框专题',
  parameters: {
    info: { inline: true },
  },
};

function mockFetch(id) {
  let cancel =false
  function isCancel() {
    return cancel
  }
  function callCancel() {
    cancel = true
  }
  const promise = new Promise<string>((resolve, reject) => {
    setTimeout(() => {
      console.log('isCancel(): ', isCancel());
      if(!isCancel()) {
        resolve(id + '返回值');
      } else {
        console.warn("参数为: " + id + "的请求取消了")
      }
      
    }, Math.random() * 2000);
  })
  return  {
    request: promise,
    cancel: callCancel
  }
}
export const 基础实现 = () => {
  const [data, setData] = useState('');
  return (
    <div>
      搜索框:{' '}
      <Input
        onChange={(key) => {
          mockFetch(key).request.then((res) => {
            setData(res);
          });
        }}
      />
      <div>服务端获取到的数据： {JSON.stringify(data)}</div>
    </div>
  );
};

export const 基础实现_计数法 = () => {
  const [data, setData] = useState('');
  const counterRef = useRef(0);
  return (
    <div>
      搜索框:{' '}
      <Input
        onChange={(key) => {
          const currentCount = ++counterRef.current;
          mockFetch(key).request.then((res) => {
            console.log('currentCount: ', currentCount, counterRef.current);
            if (currentCount === counterRef.current) {
              setData(res);
            }
          });
        }}
      />
      <div>服务端获取到的数据： {JSON.stringify(data)}</div>
    </div>
  );
};

export const 基础实现_取消法 = () => {
  const [data, setData] = useState('');
  const preRequest = useRef(null);
  return (
    <div>
      搜索框:{' '}
      <Input
        onChange={(key) => {
          // 取消上次的请求
          if(preRequest.current) {
            console.log("发起cancel了", key)
            preRequest.current.cancel()
          }
          // 记录之前的请求
          const fetchObj = mockFetch(key)
          preRequest.current = fetchObj
          // 发起请求
          fetchObj.request.then((res) => {
            setData(res);
          });
        }}
      />
      <div>服务端获取到的数据： {JSON.stringify(data)}</div>
    </div>
  );
};
