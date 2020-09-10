import React, { useState, useMemo } from 'react';
import { Button, InputNumber } from 'antd';
import 'antd/dist/antd.css'
export default {
  title: '场景专题/最大请求队列',
  parameters: {
    info: { inline: true },
  },
};

function buildMaxConcurrentReuqest(maxConcurrentCount: number = 4) {
  let waitQueue = [] as any;
  let concurrentCount = 0;
  return async (...args) => {
    if (concurrentCount >= maxConcurrentCount) {
      await new Promise((resolve) => {
        waitQueue.push(resolve);
      });
    }
    return new Promise((resolve) => {
      concurrentCount++;
      setTimeout(() => {
        resolve(...args);
        concurrentCount--;
        const waitResolve = waitQueue.shift();
        waitResolve && waitResolve();
      }, 2000);
    });
  };
}

export const 并发请求示例 = () => {
  const [requestList, setRequestList] = useState<
  { id: number; finish: boolean }[]
  >([]);
  const [concurrentCount, setConcurrentCount] = useState(4)
  const request = useMemo(() => buildMaxConcurrentReuqest(concurrentCount), [concurrentCount]);
  return (
    <div>
      请求并发数量
      <InputNumber value={concurrentCount} onChange={(v) => {
        setConcurrentCount(Number(v))
      }} />
      <Button
        onClick={() => {
          for (let index = 0; index < 10; index++) {
            setRequestList((requestList) => requestList.concat({ id: index, finish: false }));
            request().then((res) => {
              console.log('index: ', index);
              setRequestList((requestList) => {
                return [
                  ...requestList.slice(0, index),
                  { ...requestList[index], finish: true },
                  ...requestList.slice(index + 1),
                ]
              });
            });
          }
        }}
      >
        模拟发出请求
      </Button>
      {requestList.map(item => {
        return <div>请求id为{item.id}, 当前状态: { item.finish ? '请求完成': '请求中'}</div>
      })}
    </div>
  );
};
