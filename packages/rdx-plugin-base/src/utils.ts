import { TaskEventType, ISnapShot } from '@czwcode/rdx';
import { DataPersistSnapShot } from './DataPersistence';

export function getDefaultSnapShot(
  eventType: TaskEventType
): DataPersistSnapShot {
  return {
    // 事件类型
    type: eventType,
    graph: [],
    // 原来点的运行状态
    preRunningPoints: [],
    // 触发点
    triggerPoints: [],
    // 被触发的点
    effectPoints: [],
    // 冲突的点
    conflictPoints: [],
    // 当前所有的点
    currentAllPoints: [],
    // 减枝过程
    edgeCutFlow: [],
    // 当前的点
    currentRunningPoints: [],
    // 当前点的状态
    status: [],
    // 当前节点的数据状态
    states: [],
  };
}
