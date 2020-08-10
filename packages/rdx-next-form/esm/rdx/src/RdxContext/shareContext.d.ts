import React, { Consumer, Provider } from 'react';
import {
  NodeStatus,
  IBase,
  ReactionContext,
  STATUS_TYPE,
  TriggerPoint,
} from '../global';
import { BaseMap, BaseObject, Base } from './core';
import { MapObject, ProcessGraphContent, TargetType } from './interface';
import EventEmitter from 'eventemitter3';
import {
  TaskEventType,
  PreDefinedTaskQueue,
  TaskInfo,
  Task,
  CallbackInfo,
} from '@czwcode/task-queue';
import { ActionType } from './interface';
export interface TaskStatus {
  value: NodeStatus;
  quiet?: boolean;
  errorMsg?: string;
}
export interface DeliverOptions {
  refresh?: boolean;
  executeTask?: boolean;
  force?: boolean;
}
export declare class ShareContextClass<IModel, IRelyModel>
  implements ShareContext<IModel, IRelyModel> {
  name?: string;
  queue: Set<string>;
  uiQueue: Set<string>;
  triggerQueue: Set<TriggerPoint>;
  statusType: STATUS_TYPE;
  store?: MapObject<IModuleConfig>;
  eventEmitter: EventEmitter;
  dirtySets: Set<string>;
  taskScheduler: PreDefinedTaskQueue<IModel>;
  subject?: EventEmitter<TaskEventType, ProcessGraphContent>;
  tasksMap: BaseMap<IBase<IModel, IRelyModel, IModuleConfig, any>>;
  taskState: Base<IModel>;
  preTaskState: Base<IModel>;
  taskStatus: BaseObject<TaskStatus>;
  batchUiChange: any;
  batchTriggerChange: any;
  cancelMap: BaseMap<() => void>;
  onPropsChange: (
    v: {
      [key: string]: any;
    },
    vObj: any
  ) => void;
  onPropsStateChange: (key: string, value: any, type: ActionType) => void;
  parentMounted?: boolean;
  constructor(config: ShareContext<IModel, IRelyModel>);
  initSchedule(): void;
  mergeScopeState2Global(id: string): void;
  triggerQueueAdd(point: TriggerPoint): void;
  triggerSchedule(id: string, options?: DeliverOptions): void;
  batchTriggerSchedule(points: TriggerPoint[]): void;
  taskUpdateSchedule(id: string): void;
  isRecordStatus(key: string): boolean;
  /**
   *
   * 单个任务执行前的hook
   * @memberof BaseFieldContext
   */
  preChange(key: string | null): void;
  /**
   * 任务流执行失败的回调
   *
   * @memberof BaseFieldContext
   */
  onError(
    currentKey: string,
    notFinishPoint: string[],
    errorMsg: string,
    callbackInfo: CallbackInfo
  ): void;
  notifyModule(id: string, now?: boolean): void;
  /**
   * 单个任务执行后的hook
   *
   * @memberof BaseFieldContext
   */
  onChange: (callbackInfo: CallbackInfo) => void;
  getTask(): Task<IModel>[];
  getTaskInfo(
    key: string,
    taskInfo: TaskInfo
  ): ReactionContext<IModel, IRelyModel>;
  getTaskMap(id: string): IBase<IModel, IRelyModel, IModuleConfig, any>;
  getTaskState(id: string, scope: string): IModel;
  getTaskStatus(id: string): TaskStatus;
  getReducer(
    id: string
  ): (
    state: IModel,
    action: any,
    context: ShareContextClass<IModel, any, any>
  ) => IModel;
  next(id: string, value: any, options?: DeliverOptions): void;
  dispatchAction(id: string, customAction: any, options?: DeliverOptions): void;
  refresh: (key: string, value?: IModel) => void;
  mergeStateByScope(scope: any): void;
  addOrUpdateTask(
    id: string,
    taskInfo: IBase<any, any, any, any>,
    options?: {
      notifyView?: boolean;
      notifyTask?: boolean;
    }
  ): void;
  removeTask(id: string): void;
  udpateState(
    key: string,
    type: ActionType,
    targetType: TargetType,
    paylaod?: any
  ): void;
  batchUpdateState(
    tasks: {
      key: string;
      type: ActionType;
      targetType: TargetType;
      payload: any;
    }[]
  ): void;
  executeTask(taskKeys: TriggerPoint | TriggerPoint[]): void;
}
export interface ShareContext<IModel, IRelyModel> {
  /**
   * 任务信息
   */
  name?: string;
  tasksMap: BaseMap<IBase<IModel, IRelyModel, IModuleConfig, any>>;
  taskState: Base<IModel>;
  taskStatus: BaseObject<TaskStatus>;
  cancelMap: BaseMap<() => void>;
  store?: MapObject<IModuleConfig>;
  subject?: EventEmitter<TaskEventType, ProcessGraphContent>;
  parentMounted?: boolean;
}
export interface ShareContextReture<T> {
  Provider: Provider<T>;
  Consumer: Consumer<T>;
}
export declare const initValue: () => {
  tasksMap: BaseMap<any>;
  taskState: any;
  taskStatus: any;
  cancelMap: BaseMap<any>;
  parentMounted: boolean;
};
export declare const ShareContextInstance: React.Context<ShareContextClass<
  any,
  any,
  any
>>;
export declare const ShareContextProvider: React.Provider<ShareContextClass<
  any,
  any,
  any
>>;
export declare const ShareContextConsumer: any;
