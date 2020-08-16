import React, { Consumer, Provider } from 'react';
import {
  NodeStatus,
  IRdxView,
  ReactionContext,
  STATUS_TYPE,
  TriggerPoint,
  StateUpdateType,
  IStateInfo,
  ASYNC_TASK,
  SYNC_TASK,
} from '../global';
import { BaseMap, BaseObject, ScopeObject, Base } from './core';
import { MapObject, ProcessGraphContent, TargetType } from './interface';
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
import ReactDOM from 'react-dom';
import { createBaseContext, isPromise, isAsyncFunction } from '../utils';
import { IEventType } from '../../../task-queue/src/DeliverByPreDefinedTask';
import logger from '../utils/log';
import allAtoms, {
  RdxNode,
  IRdxAtomConfig,
  RdxNodeType,
} from '../RdxValues/rdxAtom';
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

export class ShareContextClass<IModel, IRelyModel>
  implements ShareContext<IModel, IRelyModel> {
  name?: string;
  queue: Set<string> = new Set();
  uiQueue: Set<string> = new Set();
  triggerQueue: Set<TriggerPoint> = new Set();
  statusType: STATUS_TYPE;
  eventEmitter: EventEmitter;
  // 当节点数据被修改了，标记为脏节点，脏节点将更新ui
  uiDirtySets: Set<string> = new Set();
  // 当节点数据被修改了，依赖节点的set中将添加脏节点
  dataDirtySets: Set<string> = new Set();
  taskScheduler: PreDefinedTaskQueue<IModel>;
  subject?: EventEmitter<TaskEventType, ProcessGraphContent>;
  preTaskState: Base<IModel>;
  tasksMap: BaseMap<IRdxView<IModel, IRelyModel, any>>;
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
    this.taskScheduler = new PreDefinedTaskQueue<IModel>([], this.canReuse);
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
        if (this.isRecordStatus(id)) {
          const status = this.getTaskStatus(id);
          if (!status || status.value !== NodeStatus.Waiting) {
            this.udpateState(id, ActionType.Update, TargetType.TaskStatus, {
              value: NodeStatus.Waiting,
              errorMsg: undefined,
            });
            this.notifyModule(id);
          }
        }
      });
    });
    this.tasksMap = config.tasksMap;
    this.taskState = config.taskState;
    this.taskStatus = config.taskStatus;
    this.cancelMap = config.cancelMap;
  }

  mergeScopeState2Global(id: string) {
    const { scope } = this.tasksMap.get(id);

    const scopeKeys = Array.from(this.tasksMap.getAll().keys()).filter(
      (key) => {
        return this.tasksMap.get(key).scope === scope;
      }
    );
    this.mergeStateByScope(scope);
    ReactDOM.unstable_batchedUpdates(() => {
      scopeKeys.forEach((scopeKey) => {
        this.triggerSchedule(scopeKey, {
          refresh: false,
          force: true,
        });
      });
    });
  }

  triggerQueueAdd(point: TriggerPoint) {
    this.triggerQueue.add(point);
    this.batchTriggerChange();
  }
  triggerSchedule(id: string, options: DeliverOptions = {} as DeliverOptions) {
    const { refresh = false, force } = options;
    const { scope } = this.getTaskMap(id);
    const point = { key: id, downStreamOnly: !refresh } as any;
    if (!force) {
      point.scope = scope;
    }
    const p = this.taskScheduler.getAllPointFired(point);
    if (p.length === 0) {
      this.onPropsChange(this.taskState.getAll(), this.taskState);
    } else {
      this.triggerQueueAdd(point);
    }
  }

  batchTriggerSchedule(points: TriggerPoint[]) {
    this.subject.emit(TaskEventType.BatchEventTrigger);
    this.executeTask(points);
  }

  taskUpdateSchedule(id: string) {
    this.subject.emit(TaskEventType.TaskChange);
    const { scope } = this.getTaskMap(id);
    this.executeTask({ key: id, scope, downStreamOnly: false });
  }
  isRecordStatus(key: string) {
    const task = this.tasksMap.get(key);
    if (!task) {
      return false;
    }
    const { recordStatus = true } = task;
    if (typeof recordStatus === 'function') {
      return recordStatus(
        this.getTaskInfo(key) as ReactionContext<IModel, IRelyModel>
      );
    } else {
      return recordStatus;
    }
  }

  /**
   * 判断节点是否可以重用
   *
   * @memberof ShareContextClass
   */
  canReuse = (id) => {
    return !this.dataDirtySets.has(id);
  };
  /**
   *
   * 单个任务执行前的hook
   * @memberof BaseFieldContext
   */
  preChange = (config: { currentKey: string }) => {
    const { currentKey: key } = config;
    // LOADING 的多种模式，1.仅在当前任务触发前开启 2. 批量任务开始时，全部置为为loading状态
    if (key) {
      if (this.isRecordStatus(key)) {
        this.udpateState(key, ActionType.Update, TargetType.TaskStatus, {
          value: NodeStatus.Running,
          errorMsg: undefined,
        });
        this.notifyModule(key);
      }
    }
  };

  /**
   * 任务流执行失败的回调
   *
   * @memberof BaseFieldContext
   */
  onError = (
    currentKey: string,
    notFinishPoint: string[],
    errorMsg: string
  ) => {
    let keys = [currentKey];
    keys = keys.concat(notFinishPoint);
    keys.forEach((k) => {
      if (this.isRecordStatus(k)) {
        this.udpateState(k, ActionType.Update, TargetType.TaskStatus, {
          value: NodeStatus.Error,
          errorMsg: errorMsg,
        });
      }
      this.notifyModule(k);
    });
  };

  notifyModule(id: string, now: boolean = false) {
    if (now) {
      this.eventEmitter.emit(id + '----' + StateUpdateType.State);
    } else {
      this.uiQueue.add(id);
      this.batchUiChange();
    }
  }

  onSuccess = (callback: CallbackInfo) => {
    const { currentKey: key } = callback;
    this.udpateState(key, ActionType.Update, TargetType.TaskStatus, {
      value: NodeStatus.IDeal,
    });
    this.preTaskState = this.taskState.clone();
    // 如果没有处理函数，则不更新模块
    if (this.uiDirtySets.has(key)) {
      // 组件有任务执行的时候需要刷新
      this.notifyModule(key);
    } else {
      logger.warn(
        `id为${key}的模块，在触发时未通过updateState执行任何数据变更`
      );
    }
    // 去掉cancel依赖
    this.cancelMap.remove(key);
  };
  onSingleTaskComplete(key: string) {
    Array.from(allAtoms.values()).forEach((atom) => {
      if (
        atom.type === RdxNodeType.Selector &&
        atom.getDeps().some((dep) => dep.id === key)
      ) {
        allAtoms.get(atom.getId()).config.onSingleTaskComplete(key, this);
      }
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
      if (all) {
        this.onPropsChange(all, this.taskState);
      }
      // 状态更新后清空
      this.uiDirtySets.clear();
    } else {
      // 脏节点
      this.removeDataDirtyKey(key);
      const currentTask = this.getTaskMap(key);
      const reactionContext = this.getTaskInfo(key) as ReactionContext<
        IModel,
        IRelyModel
      >;
      currentTask.beforeReaction && currentTask.beforeReaction();

      const success = () => {
        currentTask.afterReaction && currentTask.afterReaction();
        this.onSingleTaskComplete(key)
        onSuccess();
      }
      function fail(error) {
        currentTask.onReactionError && currentTask.onReactionError(error);
        onError(error);
      }
      const endBlock = () => {
        this.removeUiDirtyKey(key);
      };
      if (currentTask.reaction) {
        // reaction生命周期开始
        const p = (currentTask.reaction as ASYNC_TASK<IModel, IRelyModel>)(
          reactionContext
        );
        if (p instanceof Promise) {
          p.then(success)
            .catch(fail)
            .finally(endBlock);
        } else {
          try {
            success();
          } catch (error) {
            fail(error);
          } finally {
            endBlock();
          }
        }
      } else {
        success();
        endBlock();
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
 
  /**
   * 获取当前的任务列表
   */
  getTask(): {
    key: string;
    deps: IDeps[];
    scope?: string;
  }[] {
    const tasks = [...this.tasksMap.getAll().values()];
    const newTasks = (tasks as IRdxView<IModel, IRelyModel, any>[]).map(
      (task) => {
        // 判断是否是初始化应该在事件初始化的时候，如果放在回调中，那么判断就滞后了，用了回调时的taskMap判断了
        return {
          key: task.id,
          deps: task.deps,
          scope: task.scope,
        };
      }
    );
    return getGloalTask(Array.from(this.tasksMap.getAll().values())).concat(newTasks);
  }

  getTaskInfo(key: string) {
    let reactionContext: ReactionContext<IModel, IRelyModel> = {
      ...createBaseContext(key, this),
      updateState: (value: IModel) => {
        // 记录脏节点

        this.markDirtyNodes(key);
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

  getTaskMap(id: string): IRdxView<IModel, IRelyModel, any> {
    return (
      this.tasksMap.get(id) || (allAtoms.get(id) && allAtoms.get(id).config)
    );
  }
  getTaskState(id: string, scope: string) {
    return this.taskState.get(id, scope);
  }
  getTaskStatus(id: string) {
    return this.taskStatus.get(id);
  }
  getReducer(id: string) {
    const reducer = this.tasksMap.get(id).reducer;
    return reducer;
  }

  markDirtyNodes(id: string) {
    const affectNodes = this.getTask().filter((item) =>
      item.deps.some((dep) => dep.id === id)
    );

    affectNodes.forEach((item) => {
      this.uiDirtySets.add(item.key);
      this.dataDirtySets.add(item.key);
    });
  }
  next(id: string, value: any, options: DeliverOptions = { refresh : false}) {
    this.udpateState(id, ActionType.Update, TargetType.TaskState, value);
    // 用户主动调用， 记录脏节点
    this.markDirtyNodes(id);
    this.notifyModule(id, true);
    if(!options.refresh) {
      this.onSingleTaskComplete(id)
    }
    this.triggerSchedule(id, options);
  }
  dispatchAction(id: string, customAction: any, options: DeliverOptions = {}) {
    const { executeTask = true } = options;
    const { reducer, scope } = this.getTaskMap(id);
    if (reducer) {
      this.udpateState(
        id,
        ActionType.Update,
        TargetType.TaskState,
        reducer(this.getTaskState(id, scope), customAction, this)
      );
      this.notifyModule(id, true);
    }

    if (executeTask) {
      this.triggerSchedule(id, options);
    }
  }

  refresh = (key: string, value?: IModel) => {
    const { scope } = this.getTaskMap(key);
    if (value) {
      this.udpateState(key, ActionType.Update, TargetType.TaskState, value);
      this.notifyModule(key, true);
    }
    this.executeTask({ key, scope, downStreamOnly: false });
  };
  mergeStateByScope(scope) {
    this.taskState.merge(scope);
    this.taskState = this.taskState.clone();
  }
  addOrUpdateTask(
    id: string,
    taskInfo: IRdxView<any, any, any>,
    options: {
      notifyView?: boolean;
      notifyTask?: boolean;
    } = { notifyTask: true, notifyView: false }
  ) {
    const { notifyView, notifyTask } = options;
    this.udpateState(id, ActionType.Update, TargetType.TasksMap, taskInfo);
    if (notifyView) {
      this.notifyModule(id);
    }
    if (notifyTask) {
      this.triggerSchedule(id, { refresh: true });
    }
  }
  removeTask(id: string) {
    this.udpateState(id, ActionType.Remove, TargetType.TasksMap);
  }
  udpateState(
    key: string,
    type: ActionType,
    targetType: TargetType,
    paylaod?: any
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
    const exist = this.tasksMap.get(key);
    // 如何判断是内部的还是外部的
    // 节点新增，减少，只会发生在组件内部， 状态和数据更新优先作用域的内部
    if (exist || targetType === TargetType.TasksMap) {
      const scope = this.tasksMap.get(key) && this.tasksMap.get(key).scope;
      if (type === ActionType.Remove) {
        this[targetType][type](key, scope) as any;
      } else if (type === ActionType.Update) {
        this[targetType][type](key, paylaod, scope) as any;
      } else if (type === ActionType.Merge) {
        this[targetType][type](scope) as any;
      }
      this[targetType] = this[targetType].clone();
    } else {
      if (targetType === TargetType.TaskStatus) {
        allAtoms.get(key).setStatus(paylaod);
      } else if (targetType === TargetType.TaskState) {
        allAtoms.get(key).setValue(paylaod);
      }
    }
  }
  batchUpdateState(
    tasks: { key: string; type: ActionType; targetType: TargetType; payload }[]
  ) {
    tasks.forEach((item) => {
      const { key, type, targetType, payload } = item;
      this.udpateState(key, type, targetType, payload);
    });
  }
  executeTask(taskKeys: TriggerPoint | TriggerPoint[]) {
    this.taskScheduler.updateTasks(this.getTask());
    logger.info('this.getTask(): ', this.getTask());
    const currentTaskKeys = normalizeSingle2Arr(taskKeys)

    this.taskScheduler.getAllPointFired(currentTaskKeys).forEach((point) => {
      const cancel = this.cancelMap.get(point);
      if (cancel) {
        cancel();
        this.cancelMap.remove(point);
      }
    });

    this.taskScheduler.notifyDownstream(currentTaskKeys.concat(getGloalTask(currentTaskKeys.map(item => this.getTaskMap(item.key)))));
  }
}

function  getGloalTask(tasks:  IRdxView<any, any, any>[]) {
  const allDeps = union(
    tasks.reduce((allDeps, task) => {
      const { deps = [] } = task;
      return allDeps.concat(deps);
    }, []),
    (item) => item.id
  );

  const validAtomTasks = (allDeps.reduce(
    (validAtoms: RdxNode<IRdxAtomConfig<any>>[], deps) => {
      if (allAtoms.has(deps.id)) {
        return validAtoms.concat(allAtoms.get(deps.id));
      } else {
        return validAtoms;
      }
    },
    []
  ) as RdxNode<IRdxAtomConfig<any>>[]).map((item) => ({
    key: item.getId(),
    deps: item.getDeps(),
  }));
  return validAtomTasks;
}
export interface ShareContext<IModel, IRelyModel> {
  /**
   * 任务信息
   */
  name?: string;
  tasksMap: BaseMap<IRdxView<IModel, IRelyModel, any>>;
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
