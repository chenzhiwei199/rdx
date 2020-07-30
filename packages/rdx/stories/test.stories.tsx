import React, { useState } from 'react';
import { TaskContext, TaskItem } from '../src';
import produce from 'immer';
export default {
  title: 'Demo',
  // component: Text,
};

const task = () => {
  return new Promise(resolve => {
    console.log('A任务执行中');
    setTimeout(() => {
      resolve(222);
    }, 2000);
  });
};
export const simple = () => {
  const [value, setValue] = useState<any>({});
  const [configValue, setConfigValue] = useState<any>({ A:{ t: 1}});
  const [updateRely, setUpdateRely] = useState<any>(false);
  const [showMore, setShowMore] = useState<any>(false);
  const [remove, setRemove] = useState<any>(false);
  const [removeRoot, setRemoveRoot] = useState<any>(false);
  return (
    <div>
      <div
        onClick={() => {
          setShowMore(true);
        }}
      >
        添加节点
      </div>
      <div
        onClick={() => {
          setRemove(true);
        }}
      >
        删除节点普通节点
      </div>
      <div
        onClick={() => {
          setRemoveRoot(true);
        }}
      >
        删除被依赖的节点
      </div>
      <div
        onClick={() => {
          setConfigValue(produce(configValue, (configValue) => {
            configValue.A.t = 2
          }))
        }}
      >
        修改任务配置数据
      </div>
      <div
        onClick={() => {
          setUpdateRely(true)
        }}
      >
        修改依赖信息
      </div>
      <TaskContext value={value} onChange={setValue} store={configValue}>
        {!removeRoot && (
          <TaskItem taskKey={'A'} task={task}>
            {context => {
              console.log('render ======================context', context);
              if (context.loading) {
                return <div>加载中</div>;
              }
              return <div>A</div>;
            }}
          </TaskItem>
        )}
        <TaskItem taskKey={'B'} task={task} relyTaskKeys={updateRely ?['A'] : ['C']}>
          {context => {
            console.log('context: ', context);
            if (context.loading) {
              return <div>加载中</div>;
            }
            return <div>B</div>;
          }}
        </TaskItem>
        {!remove && (
          <TaskItem taskKey={'C'} task={task}>
            {context => {
              console.log('context: ', context);
              if (context.loading) {
                return <div>加载中</div>;
              }
              return <div>B</div>;
            }}
          </TaskItem>
        )}

        {showMore &&
          ['D', 'e', 'f', 'g', 'h', 'i'].map(key => {
            return (
              <TaskItem
                taskKey={key}
                task={() => {
                  return new Promise(resolve => {
                    console.log('B任务执行中');
                    setTimeout(() => {
                      resolve(222);
                    }, 10000);
                  });
                }}
              >
                {context => {
                  console.log('context: ', context);
                  if (context.loading) {
                    return <div>加载中</div>;
                  }
                  return <div>{key}</div>;
                }}
              </TaskItem>
            );
          })}
      </TaskContext>
    </div>
  );
};
