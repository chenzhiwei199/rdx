import React, { Consumer, Provider, useContext } from 'react';
import {
  IRdxTask,
  ReactionContext,
  StateUpdateType,
  IStateInfo,
  ASYNC_TASK,
  IRdxAnyDeps,
  Status,
  IRdxSnapShotTrigger,
} from '../global';
import { BaseMap, BaseObject, ScopeObject, Base } from './core';
import { ProcessGraphContent, TargetType } from './interface';
import EventEmitter from 'eventemitter3';
import {
  TaskEventType,
  PreDefinedTaskQueue,
  ISnapShotTrigger,
  ICallbackInfo,
  normalizeSingle2Arr,
  TaskEventTriggerType,
} from '@czwcode/task-queue';
import { ActionType } from './interface';
import { createBaseContext, getDepIds } from '../utils';
import { NodeStatus, NotifyPoint, IEventType } from '@czwcode/task-queue';
import logger from '../utils/log';
import { RdxNode } from '../RdxValues/base';
export interface TaskStatus {
  value: NodeStatus;
  quiet?: boolean;
  errorMsg?: string;
}
export interface DeliverOptions {
  refresh?: boolean;
}

export interface StoreValues<GModel> {
  value: GModel | Promise<GModel> | RdxNode<GModel>;
  deps: IRdxAnyDeps[];
}

export class ShareContextClass {
  private uiQueue: Set<string> = new Set();
  private willNotifyQueue: Set<NotifyPoint> = new Set();
  private callbackQueue: Array<() => void> = [];
  private uiDirtySets: Set<string> = new Set(); // 当节点数据被修改了，标记为脏节点，脏节点将更新ui
  private dataDirtySets: Set<string> = new Set(); // 当节点数据被修改了，依赖节点的set中将添加脏节点
  private cache: Map<string, StoreValues<any>> = new Map();
  private cancelMap: BaseMap<() => void>;

  private virtualTaskState: Base<any> = new ScopeObject({}) as any;

  private tasks: BaseMap<IRdxTask<any>>;
  private taskState: Base<any>;
  private taskStatus: BaseObject<TaskStatus>;

  private _taskScheduler: PreDefinedTaskQueue<any>;
  // 订阅通知组件更新
  private eventEmitter: EventEmitter;
  private subject?: EventEmitter<TaskEventType, ProcessGraphContent>;
  private _parentMounted?: boolean = false;
  private _batchUiChange: any;
  onPropsChange: (v: { [key: string]: any }, vObj: any) => void = () => {};
  private _forceReplacedState?: boolean = false;
  constructor(config: ShareContext<any>) {
    this.eventEmitter = new EventEmitter();
    this.subject = new EventEmitter<TaskEventType, ProcessGraphContent>();
    this._taskScheduler = new PreDefinedTaskQueue<any>([], (id) => {
      return !this.dataDirtySets.has(id);
    });
    const ee = this._taskScheduler.getEE();

    ee.on(IEventType.onBeforeCall, this.preChange);
    ee.on(IEventType.onCall, this.onChange);
    ee.on(IEventType.onSuccess, this.onSuccess);
    ee.on(IEventType.onError, this.onError);
    ee.on(IEventType.onStart, (content: ISnapShotTrigger) => {
      const { currentRunningPoints } = content;
      // 通知冲突的点
      currentRunningPoints.forEach((item) => {
        const { key: id } = item;
        const status = this.getTaskStatus(id);
        if (!status || status.value !== NodeStatus.Waiting) {
          this.updateState(id, ActionType.Update, TargetType.TaskStatus, {
            value: NodeStatus.Waiting,
            errorMsg: undefined,
          });
          this.notifyModule(id, false, StateUpdateType.ReactionStatus);
        }
      });
    });
    this.tasks = config.tasks;
    this.taskState = config.taskState;
    this.virtualTaskState = config.virtualTaskState;
    this.taskStatus = config.taskStatus;
    this.cancelMap = config.cancelMap;
  }

  get taskScheduler() {
    return this._taskScheduler;
  }
  get batchUiChange() {
    return this._batchUiChange;
  }
  set batchUiChange(callback) {
    this._batchUiChange = callback;
  }
  get parentMounted() {
    return this._parentMounted;
  }
  set parentMounted(value) {
    this._parentMounted = value;
  }
  setChangeCallback(callback) {
    this.onPropsChange = callback;
  }
  getSubject() {
    return this.subject;
  }
  getUiQueue() {
    return this.uiQueue;
  }
  getNotifyQueue() {
    return this.willNotifyQueue;
  }

  getCallbackQueue() {
    return this.callbackQueue;
  }

  clearCallbackQueue() {
    this.callbackQueue = [];
  }
  getEventEmitter() {
    return this.eventEmitter;
  }
  setCache(key, value) {
    this.cache.set(key, value);
  }
  hasCache(key) {
    return this.cache.has(key);
  }
  deleteCache(key) {
    this.cache.delete(key);
  }
  getCache(key) {
    return this.cache.get(key);
  }
  getDeps(id: string) {
    return this.getTaskById(id).deps || [];
  }
  setDeps(id: string, deps: IRdxAnyDeps[]) {
    this.tasks.update(id, {
      ...this.getTaskById(id),
      deps,
    });
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
      this.updateState(key, ActionType.Update, TargetType.TaskStatus, {
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
      this.updateState(k, ActionType.Update, TargetType.TaskStatus, {
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
  reset = (ids: string[]) => {
    for (let id of ids) {
      this.getTaskById(id).reset(this);
    }
    this.notifyDownStreamPoints(
      ids.map((id) => ({ key: id, downStreamOnly: true })),
      TaskEventTriggerType.Reset
    );
  };
  resetById = (id: string) => {
    this.getTaskById(id).reset(this);
    this.notifyDownStreamPoints(
      [{ key: id, downStreamOnly: true }],
      TaskEventTriggerType.ResetById
    );
  };
  set = (id: string, value: any) => {
    this.updateState(id, ActionType.Update, TargetType.TaskState, value);
  };
  onSuccess = (callback: ICallbackInfo) => {
    const { currentKey: key } = callback;
    this.updateState(key, ActionType.Update, TargetType.TaskStatus, {
      value: NodeStatus.IDeal,
    });
    // 节点标记执行完成后，触发其他依赖项的更新
    this.fireWhenDepsUpdate(key);
    logger.info('onTaskExecutingEnd', key);
    logger.info(
      'UI onSuccess',
      `successKey: ${key}`,
      `dirtyKeys: ${JSON.stringify(Array.from(this.uiDirtySets))}`
    );
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
  fireWhenDepsUpdate(key: string) {
    this.getTask()
      .filter((task) => task.deps.some((dep) => dep === key))
      .forEach((task) => {
        const { fireWhenDepsUpdate } = this.getTaskById(task.key);
        fireWhenDepsUpdate && fireWhenDepsUpdate(key);
      });
  }
  /**
   * 单个任务执行后的hook
   *
   * @memberof BaseFieldContext
   */
  onChange = (callbackInfo: ICallbackInfo) => {
    // 1. 清理脏节点
    // 2. 标记脏节点
    const { currentKey: key, close, onSuccess, onError, isEnd } = callbackInfo;
    logger.info('onTaskExecuting', key, isEnd, this.taskState.getAll());
    if (isEnd) {
      // this.getSubject().emit(TaskEventType.TaskExecutingEnd);
      this.cancelMap.removeAll();
      this.onPropsChange(this.taskState.getAll(), this.taskState);
      this.getCallbackQueue().forEach((item) => {
        item();
      });
      this.clearCallbackQueue();
      // 状态更新后清空
      this.dataDirtySets.clear();
      this.uiDirtySets.clear();
    } else {
      // 脏节点
      this.removeDataDirtyKey(key);
      const currentTask = this.getTaskById(key);
      const reactionContext = this.createReactionContext(
        key,
        close
      ) as ReactionContext<any>;

      const success = () => {
        onSuccess();
      };
      function fail(error) {
        onError(error);
      }
      if (currentTask.reaction) {
        // reaction生命周期开始
        const p = (currentTask.reaction as ASYNC_TASK<any>)(reactionContext);
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

  createTaskForSchedule() {
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
    const tasks = [...this.tasks.getAll().values()];
    const newTasks = (tasks as IRdxTask<any>[]).map((task) => {
      // 判断是否是初始化应该在事件初始化的时候，如果放在回调中，那么判断就滞后了，用了回调时的taskMap判断了
      return {
        key: task.id,
        deps: getDepIds(task.deps),
      };
    });
    return newTasks;
  }

  createReactionContext(key: string, close: () => void) {
    let reactionContext: ReactionContext<any> = {
      ...createBaseContext(key, this),
      close: close,
      updateState: (value: any) => {
        // 记录脏节点
        this.markDirtyNodes({ key, includesSelf: true });
        this.updateState(key, ActionType.Update, TargetType.TaskState, value);
      },
      callbackMapWhenConflict: (callback: () => void) => {
        const cancel = this.cancelMap.get(key);
        if (cancel) {
          cancel();
          this.cancelMap.remove(key);
        }
        this.updateState(
          key,
          ActionType.Update,
          TargetType.CancelMap,
          callback
        );
      },
    };
    return reactionContext;
  }

  markWaiting(id: string) {
    this.setTaskStatus(id, { value: Status.Waiting });
  }
  markIDeal(id: string) {
    this.setTaskStatus(id, { value: Status.IDeal });
  }
  isTaskReady(id: string) {
    return (
      this.getTaskStatus(id) && this.getTaskStatus(id).value === Status.IDeal
    );
  }
  hasTask(id: string) {
    return !!this.getTaskById(id);
  }
  getTaskById(id: string): IRdxTask<any> {
    return this.tasks.get(id);
  }
  getTasks() {
    return this.tasks.getAll();
  }
  getAllTaskState() {
    return this.taskState.getAll();
  }
  getTaskState() {
    return this.taskState;
  }
  getTaskStateById(id: string, scope?: string) {
    if (this.getTaskById(id) && this.getTaskById(id).getValue) {
      return this.getTaskById(id).getValue(id);
    }
    return this.taskState.get(id, scope);
  }
  getVirtualTaskState(id) {
    return this.virtualTaskState.get(id);
  }
  getAllVirtualTaskState() {
    return this.virtualTaskState.getAll();
  }
  setVirtualTaskState(id, value) {
    return this.virtualTaskState.update(id, value);
  }
  getTaskStatus(id: string) {
    return this.taskStatus.get(id);
  }

  setTaskState(id: string, payload: any) {
    return this.updateState(
      id,
      ActionType.Update,
      TargetType.TaskState,
      payload
    );
  }

  setTaskStatus(id: string, payload: TaskStatus) {
    return this.updateState(
      id,
      ActionType.Update,
      TargetType.TaskStatus,
      payload
    );
  }

  /**
   * 标记脏节点
   * @param id
   * @param includesSelf  是否包含自己
   */
  markDirtyNodes(
    id:
      | { key: string; includesSelf: boolean }
      | { key: string; includesSelf: boolean }[]
  ) {
    const ids = normalizeSingle2Arr(id);
    // 依赖当前节点的项 + includesSelf 判断当前节点
    const affectNodes = this.getTask().filter(
      (item) =>
        item.deps.some((dep) => ids.some((item) => item.key === dep)) ||
        ids.some(
          (idItem) => idItem.key === item.key && idItem.includesSelf === true
        )
    );

    affectNodes.forEach((item) => {
      this.uiDirtySets.add(item.key);
      this.dataDirtySets.add(item.key);
    });
  }
  /**
   * 更新当前节点数据,需要做如下几件事：
   * 1. 标记脏节点
   * 2. 更新ui
   * 3. 进行相关的依赖检测
   * 4. 通知下游节点执行
   *
   * @param {string} id
   * @param {*} value
   * @param {DeliverOptions} [options={ refresh: false }]
   * @memberof ShareContextClass
   */
  notifyDownStreamPoints(
    collectDirtys: NotifyPoint[],
    taskEventTriggerType: TaskEventTriggerType = TaskEventTriggerType.Set
  ) {
    this.markDirtyNodes(
      collectDirtys.map((item) => ({
        key: item.key,
        includesSelf: !item.downStreamOnly,
      }))
    );
    for (let dirty of collectDirtys) {
      // 通知依赖进行更新执行
      this.fireWhenDepsUpdate(dirty.key);
      //  通知组件状态更新, 直接修改的相关数据，立即更新
      this.notifyModule(dirty.key, true, StateUpdateType.State);
      // 所有的改变元素，都要触发下游任务
    }
    this.executeTask(collectDirtys, taskEventTriggerType);
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
    value: ((oldValue: any) => any) | any,
    options: DeliverOptions = { refresh: false }
  ) {
    // 这里这个生命周期有问题，调度是在next执行过程中触发的
    this.getSubject().emit(TaskEventType.UserAction);
    const next = this.getTaskById(id).next;
    let newValue;
    if (typeof value === 'function') {
      newValue = (value as Function)(this.getTaskStateById(id));
    } else {
      newValue = value;
    }
    if (next) {
      next(this, id, newValue, options);
    } else {
      //  更新状态
      this.updateState(id, ActionType.Update, TargetType.TaskState, value);
      this.notifyDownStreamPoints([
        { key: id, downStreamOnly: !options.refresh },
      ]);
    }
  }

  mergeStateByScope(scope) {
    this.taskState.merge(scope);
    this.taskState = this.taskState.clone();
  }

  /**
   * 添加数据对象时，通过检查节点的状态，判断是否要将节点加入
   * @param id
   * @param taskInfo
   * @param notifyTask
   */
  addOrUpdateTask(id: string, taskInfo: IRdxTask<any>) {
    this.updateState(id, ActionType.Update, TargetType.TasksMap, taskInfo);
  }

  removeTask(id: string) {
    this.updateState(id, ActionType.Remove, TargetType.TaskState);
    this.updateState(id, ActionType.Remove, TargetType.TaskStatus);
    this.removeUiDirtyKey(id);
    this.removeDataDirtyKey(id);
    this.cache.delete(id);
    this.cancelMap.remove(id);
    this.updateState(id, ActionType.Remove, TargetType.TasksMap);
  }

  updateState(
    key: string,
    type: ActionType,
    targetType: TargetType,
    paylaod?: TaskStatus | any | IRdxTask<any> | (() => void)
  ) {
    this.subject.emit(TaskEventType.StateChange, {
      actionType: type,
      targetType,
      value: paylaod,
      key: key,
    } as IStateInfo);
    if (targetType === TargetType.TaskState && this.getTaskById(key).setValue) {
      this.getTaskById(key).setValue(key, paylaod as any);
    } else {
      if (type === ActionType.Remove) {
        this[targetType][type](key) as any;
      } else if (type === ActionType.Update) {
        this[targetType][type](key, paylaod) as any;
      } else if (type === ActionType.Merge) {
        this[targetType][type]() as any;
      }
      this[targetType] = this[targetType].clone();
    }
  }

  getAllPointFired(taskKeys: NotifyPoint | NotifyPoint[]) {
    this._taskScheduler.updateTasks(this.createTaskForSchedule());
    const currentTaskKeys = normalizeSingle2Arr(taskKeys);
    return this._taskScheduler.getAllPointFired(currentTaskKeys);
  }

  getProcessInfo(taskKeys: NotifyPoint | NotifyPoint[] = []) {
    return {
      ...this.taskScheduler.getExecutingStates(taskKeys),
      tasks: Array.from(this.getTasks().values()),
    } as IRdxSnapShotTrigger;
  }
  emitBase(type: TaskEventType, taskKeys: NotifyPoint | NotifyPoint[] = []) {
    this._taskScheduler.updateTasks(this.createTaskForSchedule());
    this.getSubject().emit(type, this.getProcessInfo(taskKeys));
  }
  emit(
    type: TaskEventType,
    taskEventTriggerType: TaskEventTriggerType,
    taskKeys: NotifyPoint | NotifyPoint[] = []
  ) {
    this._taskScheduler.updateTasks(this.createTaskForSchedule());
    this.getSubject().emit(type, {
      type: taskEventTriggerType,
      process: this.getProcessInfo(taskKeys),
    });
  }

  batchTriggerSchedule(taskKeys: NotifyPoint | NotifyPoint[]) {
    this.executeTask(taskKeys, null);
  }
  executeTask(
    taskKeys: NotifyPoint | NotifyPoint[],
    taskEventType: TaskEventTriggerType
  ) {
    const allFirePoint = this.getAllPointFired(taskKeys);
    const currentTaskKeys = normalizeSingle2Arr(taskKeys);
    allFirePoint.forEach((point) => {
      const cancel = this.cancelMap.get(point);
      if (cancel) {
        cancel();
        this.cancelMap.remove(point);
      }
    });
    if (allFirePoint.length > 0) {
      this.emit(TaskEventType.Trigger, taskEventType, currentTaskKeys);
      logger.info('onTaskExecutingEnd executeTask', taskEventType, taskKeys);
      this._taskScheduler.notifyDownstream(currentTaskKeys);
    }
  }
}

export interface ShareContext<GModel> {
  /**
   * 任务信息
   */
  name?: string;
  tasks: BaseMap<IRdxTask<GModel>>;
  taskState: Base<GModel>;
  virtualTaskState: Base<GModel>;
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
  tasks: new BaseMap(new Map()),
  taskState: new ScopeObject({}) as any,
  virtualTaskState: new ScopeObject({}) as any,
  taskStatus: new BaseObject({}) as any,
  cancelMap: new BaseMap(new Map()),
  parentMounted: false,
});

export function createRdxStaterContext() {
  return React.createContext<ShareContextClass>(
    new ShareContextClass(initValue())
  );
}

export const DefaultContext = createRdxStaterContext();
export function useRdxStateContext(
  context: React.Context<ShareContextClass> = DefaultContext
) {
  return useContext(context);
}
