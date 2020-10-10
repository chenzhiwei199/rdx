import {
  atom,
  watcher,
  useRdxState,
  RdxContext,
  useRdxStateLoader,
  isPromise,
  useRdxAtom,
} from '@czwcode/rdx';
import React, { useEffect, useRef, useState, useMemo } from 'react';

export default {
  title: '同步异步的状态的执行',
  parameters: {
    info: { inline: true },
  },
};

const syncAtom = atom({
  id: 'staticAtom',
  defaultValue: 1,
});

const asyncAtom = atom({
  id: 'asyncAtom',
  defaultValue: new Promise<number>((resolve) => {
    setTimeout(() => {
      resolve(3);
    }, 3000);
  }),
});

const syncWatcher = watcher({
  id: 'staticWatcher',
  get: ({ get }) => {
    return get(syncAtom) + 1;
  },
});

const syncWatcherDepsAsyncAtom = watcher({
  id: 'syncWatcherDepsAsyncAtom',
  get: ({ get }) => {
    return get(asyncAtom) + 1;
  },
});

const asyncWatcherDepsAsyncAtom = watcher({
  id: 'asyncWatcherDepsAsyncAtom',
  get: async ({ get }) => {
    console.log('asyncWatcherDepsAsyncAtom__execute');
    await pause(2000);
    const a = get(asyncAtom);
    return a + 2;
  },
});

const asyncWatcherDepsAsyncAtomSlow = watcher({
  id: 'asyncWatcherDepsAsyncAtomSlow',
  get: async ({ get }) => {
    await pause(5000);
    const a = get(asyncAtom);
    return a + 2;
  },
});
const pause = (t: number) => new Promise((resolve) => setTimeout(resolve, t));
const asyncWatcher = watcher({
  id: 'asyncWatcher',
  get: async ({ get }) => {
    await pause(2000);
    return get(syncAtom) + 1;
  },
});
const SyncComponent = ({ nodes, tips }: { nodes: any; tips?: string }) => {
  const [status1, staticAtomValue] = useRdxStateLoader(nodes[0]);
  const [status2, staticWatcherValue] = useRdxStateLoader(nodes[1]);
  const statusRef = useRef([]);
  statusRef.current = [...statusRef.current, status1];
  const statusRef2 = useRef([]);
  statusRef2.current = [...statusRef2.current, status2];

  return (
    <div>
      <div>tips: {tips}</div>
      <div>get fire count: {nodes[1].fireGetFuncCount}</div>
      <Count />
      <div>1: {staticAtomValue}</div>
      {statusRef.current.join('-')}
      <div>2: {staticWatcherValue}</div>
      {statusRef2.current.join('-')}
    </div>
  );
};
export const 同步Atom_同步watcher = () => {
  return (
    <RdxContext>
      <SyncComponent nodes={[syncAtom, syncWatcher]}></SyncComponent>
    </RdxContext>
  );
};

export const 同步Atom_异步Watcher = () => {
  return (
    <RdxContext>
      <SyncComponent nodes={[syncAtom, asyncWatcher]}></SyncComponent>
    </RdxContext>
  );
};

export const 异步Atom_同步Watcher = () => {
  return (
    <RdxContext>
      <SyncComponent
        nodes={[asyncAtom, syncWatcherDepsAsyncAtom]}
      ></SyncComponent>
    </RdxContext>
  );
};

export const 异步Atom_异步Watcher = () => {
  return (
    <RdxContext>
      <SyncComponent
        tips={'asyncWatcher加载完成的时候，asyncAtom还没有准备好，所以初始化触发一次，响应式触发一次，依赖更新再触发一次'}
        nodes={[asyncAtom, asyncWatcherDepsAsyncAtom]}
      ></SyncComponent>
    </RdxContext>
  );
};
export const 异步Atom_异步Watcher_slow = () => {
  return (
    <RdxContext>
      <SyncComponent
        nodes={[asyncAtom, asyncWatcherDepsAsyncAtomSlow]}
      ></SyncComponent>
    </RdxContext>
  );
};

export const 非受控初始化状态 = () => {
  const Test = React.useCallback(() => {
    const [atom, set] = useRdxAtom({
      id: 'test',
      defaultValue: 22
    })
  return <div>{atom}</div>
  }, [])
  return <RdxContext initializeState={{ test: 33}}>
    <Test />
  </RdxContext>
}

const Count = () => {
  const countRef = useRef(0);

  ++countRef.current;
  return <div>计数：{countRef.current}</div>;
};
