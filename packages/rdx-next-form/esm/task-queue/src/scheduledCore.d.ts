export interface Data {
    id: string;
    deps?: string[];
}
export declare type Callback = (id: string, options: {
    scheduledTask: ScheduledTask;
    next: () => void;
}) => void;
export default class ScheduledCore {
    dataSource: Data[];
    inDegree: Map<string, number>;
    deliverMap: Map<string, string[]>;
    taskQueue: ScheduledTask[];
    constructor(dataSource: Data[]);
    /**
     * 更新数据
     */
    update(dataSource: Data[]): void;
    /**
     * 创建下游通知列表
     */
    createDeliverMap(): Map<string, string[]>;
    /**
     * 创建入度表
     */
    createInDegree(): Map<string, number>;
    /**
     * 终止调用链路
     */
    stop(): void;
    canExecute(id: any): boolean;
    start(callback: Callback): void;
    batchExecute(ids: string[], callback: Callback): void;
    /**
     * 执行调用链路
     */
    execute(id: string, callback: Callback): void;
}
export declare class ScheduledTask {
    stopSingnal: boolean;
    callback: Callback;
    id: string;
    next: () => void;
    constructor(id: string, next: () => void, callback: Callback);
    isStop(): boolean;
    stop(): void;
    execute(): void;
}
