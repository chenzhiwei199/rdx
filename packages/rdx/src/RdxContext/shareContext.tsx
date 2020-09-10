import React, { Consumer, Provider } from 'react';
import {
  NodeStatus,
  IRdxView,
  ReactionContext,
  STATUS_TYPE,
  NotifyPoint,
  StateUpdateType,
  IStateInfo,
  ASYNC_TASK,
  IRdxAnyDeps,
  Status,
} from '../global';
import { BaseMap, BaseObject, ScopeObject, Base } from './core';
import { ProcessGraphContent, TargetType } from './interface';
import EventEmitter from 'eventemitter3';
import {
  TaskEventType,
  PreDefinedTaskQueue,
  ISnapShotTrigger,
  CallbackInfo,
  union,
  normalizeSingle2Arr,
  IDeps,
} from '@czwcode/task-queue';
import { ActionType } from './interface';
import { createBaseContext, getDepIds } from '../utils';
import { IEventType } from '../../../task-queue/src/DeliverByPreDefinedTask';
import logger from '../utils/log';
import { RdxNode } from '../RdxValues/base';
export interface TaskStatus {
  value: NodeStatus;
  quiet?: boolean;
  errorMsg?: string;
}
export interface DeliverOptions {
  refresh?: boolean;
  manual?: boolean;
  executeTask?: boolean;
}

export interface StoreValues<IModel> {
  value: IModel | Promise<IModel> | RdxNode<IModel>;
  deps: IRdxAnyDeps[];
}

export class ShareContextClass<IModel, IRelyModel>
  implements ShareContext<IModel, IRelyModel> {
  name?: string;
  uiQueue: Set<string> = new Set();
  willNotifyQueue: Set<NotifyPoint> = new Set();
  statusType: STATUS_TYPE;
  eventEmitter: EventEmitter;
  // 当节点数据被修改了，标记为脏节点，脏节点将更新ui
  uiDirtySets: Set<string> = new Set();
  // 当节点数据被修改了，依赖节点的set中将添加脏节点
  dataDirtySets: Set<string> = new Set();
  taskScheduler: PreDefinedTaskQueue<IModel>;
  cache: Map<string, StoreValues<IModel>> = new Map();
  subject?: EventEmitter<TaskEventType, ProcessGraphContent>;
  preTaskState: Base<IModel>;
  tasksMap: BaseMap<IRdxView<IModel, IRelyModel>>;
  taskState: Base<IModel>;
  taskStatus: BaseObject<TaskStatus>;
  batchUiChange: any;
  batchTriggerChange: any;
  cancelMap: BaseMap<() => void>;
  onPropsChange: (v: { [key: string]: any }, vObj: any) => void = () => {};
  onPropsStateChange: (
    key: string,
    value: any,
    type: ActionType
  ) => void = () => {};
  parentMounted?: boolean;
  constructor(config: ShareContext<IModel, IRelyModel>) {
    this.eventEmitter = new EventEmitter();
    this.name = config.name;
    this.subject = new EventEmitter<TaskEventType, ProcessGraphContent>();
    this.taskScheduler = new PreDefinedTaskQueue<IModel>([], (id) => {
      return !this.dataDirtySets.has(id);
    });
    const ee = this.taskScheduler.getEE();

    ee.on(IEventType.onStatusChange, (content) => {
      this.subject.emit(TaskEventType.StatusChange, content);
    });
    ee.on(IEventType.onStart, (content) => {
      this.subject.emit(TaskEventType.ProcessRunningGraph, content);
    });
    ee.on(IEventType.onBeforeCall, this.preChange);
    ee.on(IEventType.onCall, this.onChange);
    ee.on(IEventType.onSuccess, this.onSuccess);
    ee.on(IEventType.onError, this.onError);
    ee.on(IEventType.onStart, (content: ISnapShotTrigger) => {
      const { currentRunningPoints, triggerPoints, conflictPoints } = content;
      // 通知冲突的点
      currentRunningPoints.forEach((item) => {
        const { key: id } = item;
        const status = this.getTaskStatus(id);
        if (!status || status.value !== NodeStatus.Waiting) {
          this.udpateState(id, ActionType.Update, TargetType.TaskStatus, {
            value: NodeStatus.Waiting,
            errorMsg: undefined,
          });
          this.notifyModule(id, false, StateUpdateType.ReactionStatus);
        }
      });
    });
    this.tasksMap = config.tasksMap;
    this.taskState = config.taskState;
    this.taskStatus = config.taskStatus;
    this.cancelMap = config.cancelMap;
  }

  add2ScheduleQueue(point: NotifyPoint) {
    this.willNotifyQueue.add(point);
    this.batchTriggerChange();
  }
  setCache(key, value) {
    this.cache.set(key, value);
  }
  getCache(key) {
    return this.cache.get(key);
  }
  getDeps(id: string) {
    return this.getTaskMap(id).deps || [];
  }
  setDeps(id: string, deps: IRdxAnyDeps[]) {
    this.tasksMap.update(id, {
      ...this.getTaskMap(id),
      deps,
    });
  }
  triggerSchedule(id: string, options: DeliverOptions = {} as DeliverOptions) {
    const { refresh = false } = options;
    const point = { key: id, downStreamOnly: !refresh } as any;
    const firePoints = new PreDefinedTaskQueue(
      this.getTaskForSchedule()
    ).getAllPointFired(point);
    if (firePoints.length === 0) {
      this.onPropsChange(this.taskState.getAll(), this.taskState);
    } else {
      this.add2ScheduleQueue(point);
    }
  }

  batchTriggerSchedule(points: NotifyPoint[]) {
    this.subject.emit(TaskEventType.BatchEventTrigger);
    this.executeTask(points);
  }

  taskUpdateSchedule(id: string) {
    this.subject.emit(TaskEventType.TaskChange);
    this.triggerSchedule(id, { refresh: true });
  }

  /**
   *
   * 单个任务执行前的hook
   * @memberof BaseFieldContext
   */
  preChange = (config: { currentKey: string }) => {
    const { currentKey: key } = config;
    // LOADING 的多种模式，1.仅在当前任务触发前开启 2. 批量任务开始时，全部置为为loading状态
    if (key) {
      this.udpateState(key, ActionType.Update, TargetType.TaskStatus, {
        value: NodeStatus.Running,
        errorMsg: undefined,
      });
      this.notifyModule(key, false, StateUpdateType.ReactionStatus);
    }
  };

  /**
   * 任务流执行失败的回调
   *
   * @memberof BaseFieldContext
   */
  onError = (info: {
    currentKey: string;
    notFinishPoint: string[];
    errorMsg: string;
  }) => {
    const { currentKey, notFinishPoint, errorMsg } = info;
    let keys = [currentKey];
    keys = keys.concat(notFinishPoint);
    this.removeUiDirtyKey(currentKey);
    keys.forEach((k) => {
      this.udpateState(k, ActionType.Update, TargetType.TaskStatus, {
        value: NodeStatus.Error,
        errorMsg: errorMsg,
      });
      this.notifyModule(k, false, StateUpdateType.ReactionStatus);
    });
  };

  notifyModule(
    id: string,
    now: boolean = false,
    type: StateUpdateType = StateUpdateType.State
  ) {
    if (now) {
      this.eventEmitter.emit(id + '----' + type);
    } else {
      this.uiQueue.add(id + '----' + type);
      this.batchUiChange();
    }
  }
  reset = (id: string) => {
    this.udpateState(
      id,
      ActionType.Update,
      TargetType.TaskState,
      this.getTaskMap(id).defaultValue
    );
  };
  set = (id: string, value: IModel) => {
    this.udpateState(id, ActionType.Update, TargetType.TaskState, value);
  };
  onSuccess = (callback: CallbackInfo) => {
    const { currentKey: key } = callback;
    this.udpateState(key, ActionType.Update, TargetType.TaskStatus, {
      value: NodeStatus.IDeal,
    });
    logger.info(
      'UI onSuccess',
      `successKey: ${key}`,
      `dirtyKeys: ${JSON.stringify(Array.from(this.uiDirtySets))}`
    );
    this.preTaskState = this.taskState.clone();
    // 如果没有处理函数，则不更新模块
    if (this.uiDirtySets.has(key)) {
      // 组件有任务执行的时候需要刷新
      this.notifyModule(key, false, StateUpdateType.State);
      this.removeUiDirtyKey(key);
    } else {
      logger.warn(
        `id为${key}的模块，在触发时未通过updateState执行任何数据变更`
      );
    }
    // 去掉cancel依赖
    this.cancelMap.remove(key);
  };
  /**
   *  当依赖变化后，需要通知所有的依赖项
   *
   * @param {*} key
   * @memberof ShareContextClass
   */
  fireWhenDepsUpdate(key) {
    this.getTask()
      .filter((task) => task.deps.some((dep) => dep === key))
      .forEach((task) => {
        const { fireWhenDepsUpdate } = this.getTaskMap(task.key);
        fireWhenDepsUpdate && fireWhenDepsUpdate(key);
      });
  }
  /**
   * 单个任务执行后的hook
   *
   * @memberof BaseFieldContext
   */
  onChange = (callbackInfo: CallbackInfo) => {
    // 1. 清理脏节点
    // 2. 标记脏节点
    const {
      currentKey: key,
      onSuccess,
      onError,
      isCancel,
      isEnd,
    } = callbackInfo;
    logger.info('onTaskExecuting', key);
    if (isEnd) {
      const all = this.taskState.getAll();
      this.cancelMap.removeAll();
      this.onPropsChange(all, this.taskState);
      // 状态更新后清空
      this.dataDirtySets.clear();
      this.uiDirtySets.clear();
    } else {
      // 脏节点
      this.removeDataDirtyKey(key);
      const currentTask = this.getTaskMap(key);
      const reactionContext = this.getTaskInfo(key) as ReactionContext<
        IModel,
        IRelyModel
      >;

      const success = () => {
        this.fireWhenDepsUpdate(key);
        onSuccess();
      };
      function fail(error) {
        onError(error);
      }
      if (currentTask.reaction) {
        // reaction生命周期开始
        const p = (currentTask.reaction as ASYNC_TASK<IModel, IRelyModel>)(
          reactionContext
        );
        if (p instanceof Promise) {
          p.then(success).catch(fail);
        } else {
          try {
            success();
          } catch (error) {
            fail(error);
          }
        }
      } else {
        success();
      }
    }
  };

  removeUiDirtyKey(key) {
    this.uiDirtySets.delete(key);
  }

  removeDataDirtyKey(key) {
    this.dataDirtySets.delete(key);
  }
  /**
   * 重复点检查,在新增节点的时候check
   * @param id
   */
  duplicateCheck(id: string) {
    const isDuplicate = this.getTask().some((item) => item.key === id);
    if (isDuplicate) {
      logger.error(`id为${id}的节点被重复声明了`);
    }
    return isDuplicate;
  }

  getTaskForSchedule() {
    return this.getTask().map((item) => {
      return {
        ...item,
        deps: item.deps.map((item) => ({ id: item })),
      };
    });
  }
  /**
   * 获取当前的任务列表
   */
  getTask(): {
    key: string;
    deps: string[];
    scope?: string;
  }[] {
    const tasks = [...this.tasksMap.getAll().values()];
    const newTasks = (tasks as IRdxView<IModel, IRelyModel>[]).map((task) => {
      // 判断是否是初始化应该在事件初始化的时候，如果放在回调中，那么判断就滞后了，用了回调时的taskMap判断了
      return {
        key: task.id,
        deps: getDepIds(task.deps),
      };
    });
    return newTasks;
  }

  getTaskInfo(key: string) {
    let reactionContext: ReactionContext<IModel, IRelyModel> = {
      ...createBaseContext(key, this),
      updateState: (value: IModel) => {
        // 记录脏节点
        this.markDirtyNodes(key, true);
        this.udpateState(key, ActionType.Update, TargetType.TaskState, value);
      },
      callbackMapWhenConflict: (callback: () => void) => {
        const cancel = this.cancelMap.get(key);
        if (cancel) {
          cancel();
          this.cancelMap.remove(key);
        }
        this.udpateState(
          key,
          ActionType.Update,
          TargetType.CancelMap,
          callback
        );
      },
    };
    return reactionContext;
  }

  isTaskReady(id: string) {
    return (
      this.getTaskStatus(id) && this.getTaskStatus(id).value === Status.IDeal
    );
  }
  hasTask(id: string) {
    return !!this.getTaskMap(id);
  }
  getTaskMap(id: string): IRdxView<IModel, IRelyModel> {
    return this.tasksMap.get(id);
  }
  getTaskState(id: string, scope?: string) {
    return this.taskState.get(id, scope);
  }
  getTaskStatus(id: string) {
    return this.taskStatus.get(id);
  }

  setTaskState(id: string, payload: IModel) {
    return this.udpateState(
      id,
      ActionType.Update,
      TargetType.TaskState,
      payload
    );
  }

  setTaskStatus(id: string, payload: TaskStatus) {
    return this.udpateState(
      id,
      ActionType.Update,
      TargetType.TaskStatus,
      payload
    );
  }

  markDirtyNodes(id: string | string[], includesSelf: boolean = false) {
    const ids = normalizeSingle2Arr(id);
    const affectNodes = this.getTask().filter(
      (item) =>
        item.deps.some((dep) => ids.includes(dep)) ||
        (includesSelf ? ids.includes(item.key) : false)
    );

    affectNodes.forEach((item) => {
      this.uiDirtySets.add(item.key);
      this.dataDirtySets.add(item.key);
    });
  }
  /**
   * 更新当前节点数据，刷新ui，并标记dirtyUI
   *
   * @param {string} id
   * @param {*} value
   * @param {DeliverOptions} [options={ refresh: false }]
   * @memberof ShareContextClass
   */
  updateValue(id: string, value: any, refresh: boolean = false) {
    //  更新状态
    this.udpateState(id, ActionType.Update, TargetType.TaskState, value);
    // 用户主动调用， 记录脏节点
    this.markDirtyNodes(id, refresh);
    //  通知组件状态更新
    this.notifyModule(id, true, StateUpdateType.State);
  }

  /**
   * 用户和页面的最新的交互行为
   *
   * @param {string} id
   * @param {*} value
   * @param {DeliverOptions} [options={ refresh: false }]
   * @memberof ShareContextClass
   */
  next(
    id: string,
    value: ((oldValue: IModel) => IModel) | IModel,
    options: DeliverOptions = { refresh: false }
  ) {
    const next = this.getTaskMap(id).next;
    let newValue;
    if (typeof value === 'function') {
      newValue = (value as Function)(this.getTaskState(id));
    } else {
      newValue = value;
    }
    const manualOptions = { ...options, manual: true };
    if (next) {
      next(this, id, newValue, manualOptions);
    } else {
      this.updateValue(id, newValue, options.refresh);
      //  通知组件状态更新
      this.triggerSchedule(id, manualOptions);
    }
    this.fireWhenDepsUpdate(id);
  }

  mergeStateByScope(scope) {
    this.taskState.merge(scope);
    this.taskState = this.taskState.clone();
  }
  addOrUpdateTask(
    id: string,
    taskInfo: IRdxView<any, any>,
    notifyTask: boolean = false
  ) {
    this.udpateState(id, ActionType.Update, TargetType.TasksMap, taskInfo);
    if (this.parentMounted) {
      notifyTask && this.triggerSchedule(id, { refresh: true });
    } else {
      this.willNotifyQueue.add({ key: id, downStreamOnly: false });
    }
  }
  removeTask(id: string) {
    this.udpateState(id, ActionType.Remove, TargetType.TasksMap);
  }

  udpateState(
    key: string,
    type: ActionType,
    targetType: TargetType,
    paylaod?: TaskStatus | IModel | IRdxView<IModel, IRelyModel> | (() => void)
  ) {
    this.subject.emit(TaskEventType.StateChange, {
      actionType: type,
      targetType,
      value: paylaod,
      key: key,
    } as IStateInfo);
    if (targetType === TargetType.TaskState) {
      // 标记dirty
      this.onPropsStateChange(key, paylaod, type);
    }
    if (type === ActionType.Remove) {
      this[targetType][type](key) as any;
    } else if (type === ActionType.Update) {
      this[targetType][type](key, paylaod) as any;
    } else if (type === ActionType.Merge) {
      this[targetType][type]() as any;
    }
    this[targetType] = this[targetType].clone();
  }
  batchUpdateState(
    tasks: { key: string; type: ActionType; targetType: TargetType; payload }[]
  ) {
    tasks.forEach((item) => {
      const { key, type, targetType, payload } = item;
      this.udpateState(key, type, targetType, payload);
    });
  }
  executeTask(taskKeys: NotifyPoint | NotifyPoint[]) {
    this.taskScheduler.updateTasks(this.getTaskForSchedule());
    logger.info('this.getTask(): ', this.getTask());
    const currentTaskKeys = normalizeSingle2Arr(taskKeys);

    this.taskScheduler.getAllPointFired(currentTaskKeys).forEach((point) => {
      const cancel = this.cancelMap.get(point);
      if (cancel) {
        cancel();
        this.cancelMap.remove(point);
      }
    });

    logger.info('executeTask: ', currentTaskKeys);
    this.taskScheduler.notifyDownstream(currentTaskKeys);
  }
}

export interface ShareContext<IModel, IRelyModel> {
  /**
   * 任务信息
   */
  name?: string;
  tasksMap: BaseMap<IRdxView<IModel, IRelyModel>>;
  taskState: Base<IModel>;
  taskStatus: BaseObject<TaskStatus>;
  cancelMap: BaseMap<() => void>;
  subject?: EventEmitter<TaskEventType, ProcessGraphContent>;
  parentMounted?: boolean;
}
export interface ShareContextReture<T> {
  Provider: Provider<T>;
  Consumer: Consumer<T>;
}

export const initValue = () => ({
  tasksMap: new BaseMap(new Map()),
  taskState: new ScopeObject({}) as any,
  taskStatus: new BaseObject({}) as any,
  cancelMap: new BaseMap(new Map()),
  parentMounted: false,
});

export const ShareContextInstance = React.createContext<
  ShareContextClass<any, any>
>(initValue() as any);

export const ShareContextProvider = ShareContextInstance.Provider;
export const ShareContextConsumer = ShareContextInstance.Consumer as any;
