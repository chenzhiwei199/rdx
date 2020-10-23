import {
  atom,
  compute,
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

const syncCompute = compute({
  id: 'staticCompute',
  get: ({ get }) => {
    return get(syncAtom) + 1;
  },
});

const syncComputeDepsAsyncAtom = compute({
  id: 'syncComputeDepsAsyncAtom',
  get: ({ get }) => {
    return get(asyncAtom) + 1;
  },
});

const asyncComputeDepsAsyncAtom = compute({
  id: 'asyncComputeDepsAsyncAtom',
  get: async ({ get }) => {
    console.log('asyncComputeDepsAsyncAtom__execute');
    await pause(2000);
    const a = get(asyncAtom);
    return a + 2;
  },
});

const asyncComputeDepsAsyncAtomSlow = compute({
  id: 'asyncComputeDepsAsyncAtomSlow',
  get: async ({ get }) => {
    await pause(5000);
    const a = get(asyncAtom);
    return a + 2;
  },
});
const pause = (t: number) => new Promise((resolve) => setTimeout(resolve, t));
const asyncCompute = compute({
  id: 'asyncCompute',
  get: async ({ get }) => {
    await pause(2000);
    return get(syncAtom) + 1;
  },
});
const SyncComponent = ({ nodes, tips }: { nodes: any; tips?: string }) => {
  const [status1, staticAtomValue] = useRdxStateLoader(nodes[0]);
  const [status2, staticComputeValue] = useRdxStateLoader(nodes[1]);
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
      <div>2: {staticComputeValue}</div>
      {statusRef2.current.join('-')}
    </div>
  );
};
export const 同步Atom_同步compute = () => {
  return (
    <RdxContext>
      <SyncComponent nodes={[syncAtom, syncCompute]}></SyncComponent>
    </RdxContext>
  );
};

export const 同步Atom_异步Compute = () => {
  return (
    <RdxContext>
      <SyncComponent nodes={[syncAtom, asyncCompute]}></SyncComponent>
    </RdxContext>
  );
};

export const 异步Atom_同步Compute = () => {
  return (
    <RdxContext>
      <SyncComponent
        nodes={[asyncAtom, syncComputeDepsAsyncAtom]}
      ></SyncComponent>
    </RdxContext>
  );
};

export const 异步Atom_异步Compute = () => {
  return (
    <RdxContext>
      <SyncComponent
        tips={'asyncCompute加载完成的时候，asyncAtom还没有准备好，所以初始化触发一次，响应式触发一次，依赖更新再触发一次'}
        nodes={[asyncAtom, asyncComputeDepsAsyncAtom]}
      ></SyncComponent>
    </RdxContext>
  );
};
export const 异步Atom_异步Compute_slow = () => {
  return (
    <RdxContext>
      <SyncComponent
        nodes={[asyncAtom, asyncComputeDepsAsyncAtomSlow]}
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
