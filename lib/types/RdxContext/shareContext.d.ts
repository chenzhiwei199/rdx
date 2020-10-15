import { Consumer, Provider } from 'react';
import { IRdxTask, ReactionContext, StateUpdateType, IRdxAnyDeps, IRdxSnapShotTrigger } from '../global';
import { BaseMap, BaseObject, Base } from './core';
import { ProcessGraphContent, TargetType } from './interface';
import EventEmitter from 'eventemitter3';
import { TaskEventType, PreDefinedTaskQueue, ICallbackInfo, TaskEventTriggerType } from '@czwcode/task-queue';
import { ActionType } from './interface';
import { NodeStatus, NotifyPoint } from '@czwcode/task-queue';
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
export declare class ShareContextClass {
    private uiQueue;
    private willNotifyQueue;
    private callbackQueue;
    private uiDirtySets;
    private dataDirtySets;
    private cache;
    private cancelMap;
    private virtualTaskState;
    private tasks;
    private taskState;
    private taskStatus;
    private _taskScheduler;
    private eventEmitter;
    private subject?;
    private _parentMounted?;
    private _batchUiChange;
    onPropsChange: (v: {
        [key: string]: any;
    }, vObj: any) => void;
    onPropsLoading: () => void;
    constructor(config: ShareContext<any>);
    get taskScheduler(): PreDefinedTaskQueue<any>;
    get batchUiChange(): any;
    set batchUiChange(callback: any);
    get parentMounted(): boolean;
    set parentMounted(value: boolean);
    setChangeCallback(callback: any): void;
    setLoadingCallback(callback: any): void;
    getSubject(): EventEmitter<TaskEventType, ProcessGraphContent>;
    getUiQueue(): Set<string>;
    getNotifyQueue(): Set<NotifyPoint>;
    getCallbackQueue(): (() => void)[];
    clearCallbackQueue(): void;
    getEventEmitter(): EventEmitter<string | symbol, any>;
    setCache(key: any, value: any): void;
    hasCache(key: any): boolean;
    deleteCache(key: any): void;
    getCache(key: any): StoreValues<any>;
    getDeps(id: string): import("..").IRdxDeps<any>[];
    setDeps(id: string, deps: IRdxAnyDeps[]): void;
    /**
     *
     * 单个任务执行前的hook
     * @memberof BaseFieldContext
     */
    preChange: (config: {
        currentKey: string;
    }) => void;
    /**
     * 任务流执行失败的回调
     *
     * @memberof BaseFieldContext
     */
    onError: (info: {
        currentKey: string;
        notFinishPoint: string[];
        errorMsg: string;
    }) => void;
    notifyModule(id: string, type?: StateUpdateType): void;
    reset: (ids: string[]) => void;
    resetById: (id: string) => void;
    set: (id: string, value: any) => void;
    onSuccess: (callback: ICallbackInfo) => void;
    /**
     *  当依赖变化后，需要通知所有的依赖项
     *
     * @param {*} key
     * @memberof ShareContextClass
     */
    fireWhenDepsUpdate(key: string): void;
    /**
     * 单个任务执行后的hook
     *
     * @memberof BaseFieldContext
     */
    onChange: (callbackInfo: ICallbackInfo) => void;
    removeUiDirtyKey(key: any): void;
    removeDataDirtyKey(key: any): void;
    /**
     * 重复点检查,在新增节点的时候check
     * @param id
     */
    duplicateCheck(id: string): boolean;
    createTaskForSchedule(): {
        deps: {
            id: string;
        }[];
        key: string;
        scope?: string;
    }[];
    /**
     * 获取当前的任务列表
     */
    getStandardTasks(): {
        key: string;
        deps: string[];
        scope?: string;
    }[];
    createConflictCallback(key: string): (callback: () => void) => void;
    createReactionContext(key: string, close: () => void, isCancel: () => boolean): ReactionContext<any>;
    markWaiting(id: string): void;
    markIDeal(id: string): void;
    isTaskReady(id: string): boolean;
    hasTask(id: string): boolean;
    getTaskById(id: string): IRdxTask<any>;
    getTasks(): Map<string, IRdxTask<any>>;
    getAllTaskState(): any;
    getTaskState(): Base<any>;
    getTaskStateById(id: string, scope?: string): any;
    getVirtualTaskState(id: any): any;
    getAllVirtualTaskState(): any;
    setVirtualTaskState(id: any, value: any): void;
    getTaskStatusById(id: string): TaskStatus;
    setTaskState(id: string, payload: any): void;
    setTaskStatus(id: string, payload: TaskStatus): void;
    /**
     * 标记脏节点
     * @param id
     * @param includesSelf  是否包含自己
     */
    markDirtyNodes(id: {
        key: string;
        includesSelf: boolean;
    } | {
        key: string;
        includesSelf: boolean;
    }[]): void;
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
    notifyDownStreamPoints(collectDirtys: NotifyPoint[], taskEventTriggerType?: TaskEventTriggerType): void;
    /**
     * 用户和页面的最新的交互行为
     *
     * @param {string} id
     * @param {*} value
     * @param {DeliverOptions} [options={ refresh: false }]
     * @memberof ShareContextClass
     */
    next(id: string, value: ((oldValue: any) => any) | any, options?: DeliverOptions): void;
    mergeStateByScope(scope: any): void;
    /**
     * 添加数据对象时，通过检查节点的状态，判断是否要将节点加入
     * @param id
     * @param taskInfo
     * @param notifyTask
     */
    addOrUpdateTask(id: string, taskInfo: IRdxTask<any>): void;
    removeTask(id: string): void;
    updateState(key: string, type: ActionType, targetType: TargetType, paylaod?: TaskStatus | any | IRdxTask<any> | (() => void)): void;
    getAllPointFired(taskKeys: NotifyPoint | NotifyPoint[]): string[];
    getProcessInfo(taskKeys?: NotifyPoint | NotifyPoint[]): IRdxSnapShotTrigger;
    emitBase(type: string): void;
    emit(type: TaskEventType, taskEventTriggerType: TaskEventTriggerType | string, taskKeys?: NotifyPoint | NotifyPoint[]): void;
    executeTask(taskKeys: NotifyPoint | NotifyPoint[], taskEventType: TaskEventTriggerType | string): void;
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
export declare const initValue: () => {
    tasks: BaseMap<any>;
    taskState: any;
    virtualTaskState: any;
    taskStatus: any;
    cancelMap: BaseMap<any>;
    parentMounted: boolean;
};
