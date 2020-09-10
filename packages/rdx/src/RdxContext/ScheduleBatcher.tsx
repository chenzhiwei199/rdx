import React, { useEffect, useState, useContext } from 'react';
import { ShareContextInstance, ShareContextClass } from './shareContext';
import { RdxNode } from '../RdxValues';
import logger from '../utils/log';

const ScheduleBatcher = (props: { setNotifyBatcherOfChange: any }) => {
  const storeRef = useContext<ShareContextClass<any, any>>(
    ShareContextInstance
  );
  const [_, setState] = useState([]);
  props.setNotifyBatcherOfChange(() => setState({} as any));
  useEffect(() => {
    if (storeRef.willNotifyQueue.size > 0) {
      // const depsRdxNodes = new Set<RdxNode<any>>();
      // // 收集相关节点依赖
      // for (let point of storeRef.willNotifyQueue.values()) {
      //   const deps = storeRef.getDeps(point.key);
      //   for (let dep of deps) {
      //     if (dep instanceof RdxNode) {
      //       depsRdxNodes.add(dep);
      //     }
      //   }
      // }
      // // 添加相关节点依赖
      // for (let atom of depsRdxNodes) {
      //   // 不存在才添加
      //   if (!storeRef.getTaskMap(atom.getId())) {
      //     storeRef.addOrUpdateTask(atom.getId(), atom.load(storeRef), false);
      //   }
      // }
      logger.info('Schedule Batcher', Array.from(storeRef.willNotifyQueue));
      storeRef.batchTriggerSchedule(Array.from(storeRef.willNotifyQueue));
    }
    storeRef.willNotifyQueue.clear();
  });

  return null;
};

export default ScheduleBatcher;
