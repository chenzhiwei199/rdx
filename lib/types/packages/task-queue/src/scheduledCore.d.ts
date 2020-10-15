export interface Data {
    id: string;
    deps?: string[];
}
/**
 * 任务执行单元
 * id:当前任务唯一标识
 */
export declare type Callback = (id: string, options: CallbackOptions) => void;
/**
 * next: 通过该方法通知下游任务执行
 * isStop: 通过该方法判断任务是否终止
 * close: 通过该方法，关闭任务执行，并且不执行下游任务
 */
export interface CallbackOptions {
    isPause: () => boolean;
    close: () => void;
    next: () => void;
}
/**
 * 任务执行管理器
 * 1. 支持任务Pause
 * 2. 支持任务Continue
 *
 * @export
 * @class ScheduledCore
 */
export default class ScheduledCore {
    dataSource: Data[];
    inDegree: Map<string, number>;
    deliverMap: Map<string, string[]>;
    taskQueue: Map<string, ScheduledTask>;
    constructor(dataSource: Data[]);
    /**
     * 更新数据
     */
    update(dataSource: Data[], canReuse?: (id: any) => boolean): void;
    /**
     * 关闭某个任务
     *
     * @param {string} key
     * @memberof ScheduledCore
     */
    closeTask(key: string): void;
    /**
     * 创建下游通知列表
     */
    createDeliverMap(): Map<string, string[]>;
    /**
     * 创建入度表
     */
    createInDegree(): Map<string, number>;
    canExecute(id: any): boolean;
    getStartPoints(): string[];
    start(callback: Callback): void;
    batchExecute(ids: string[], callback: Callback): void;
    /**
     * 执行调用链路
     */
    execute(id: string, callback: Callback): void;
}
export declare class ScheduledTask {
    pauseSignal: boolean;
    finishSignal: boolean;
    executeCallback: Callback;
    id: string;
    next: () => void;
    close: () => void;
    promise: Promise<any>;
    resolvePersist: () => void;
    pauseCallback?: () => void;
    uniqId: string;
    constructor(config: {
        id: string;
        next: () => void;
        close: () => void;
        executeCallback: Callback;
        pauseCallback?: () => void;
    });
    isPause(): boolean;
    pause(): void;
    /**
     * 执行任务,
     *
     * @memberof ScheduledTask
     */
    execute(): void;
    fork(config: {
        next: () => void;
        close: () => void;
    }): ScheduledTask;
}
