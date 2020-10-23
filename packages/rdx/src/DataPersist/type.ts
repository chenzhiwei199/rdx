import { IRdxSnapShotTrigger, IStateInfo, IStatusInfo } from '../global';

export interface ISnapShot extends IRdxSnapShotTrigger {
  // 事件类型
  type: TaskEventType;
  // 当前点的状态
  status: IStatusInfo[];
}

export enum TaskEventTriggerType {
  TriggerByTaskInit = 'TriggerByTaskInit',
  DepsUpdate = 'DepsUpdate',
  BatchEventTrigger = 'BatchEventTrigger',
  BatchReactionOnMount = 'BatchReactionOnMount',
  Reset = 'Reset',
  ResetById = 'ResetById',
  TaskCreated = 'TaskCreated',
  Set = 'Set',
}
/**
 *  1. 如果只有atom的情况，
 */
export enum TaskEventType {
  Trigger = 'Trigger',
   /**
   * 依赖动态更新
   */
  DynamicDepsUpdate = 'DynamicDepsUpdate',
  /**
   * 任务节点加载
   */
  TaskLoad = 'TaskLoad',
   /**
   * 任务节点加载结束
   */
  TaskLoadEnd = 'TaskLoadEnd',
  /**
   * 用户操作
   */
  UserAction = 'UserAction',
  /**
   * 异步任务执行中
   */
  TaskExecutingEnd = 'TaskExecutingEnd',
  /**
   * 任务状态变更
   */
  StateChange = 'StateChange',
}

export interface DataPersistSnapShot extends ISnapShot {
  states: IStateInfo[];
}

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
    // 当前的点
    currentRunningPoints: [],
    // 当前点的状态
    status: [],
    // 当前节点的数据状态
    states: [],
  };
}
