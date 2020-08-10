import { NodeStatus, BasePoint, Point } from '@czwcode/graph-core';
export declare type Callback = (currentKey: string | null, isRouterEnd: boolean, isCancel: () => boolean, next: () => void) => void;
export declare type BaseCallback = (currentKey: string, next: () => void) => void;
export declare type ASYNC_TASK<T> = (taskInfo: TaskInfo) => Promise<void>;
export declare type SYNC_TASK<T> = (taskInfo: TaskInfo) => void;
export declare type MixedTask<T> = ASYNC_TASK<T> | SYNC_TASK<T>;
export interface IDeps {
    id: string;
    weight?: number;
}
export interface PointWithWeight extends BasePoint {
    deps?: IDeps[];
}
export interface Task<T> extends PointWithWeight {
    taskType?: ReactionType;
    task: MixedTask<T>;
    reusableDetection?: (taskInfo: Point) => boolean;
}
export interface TaskInfo extends Point {
    isCancel: () => boolean;
    next: () => void;
}
export interface CallbackInfo {
    currentKey?: string | null;
    isEnd?: boolean;
}
export declare enum ReactionType {
    Sync = 1,
    Async = 2
}
export interface STATUS_CHANGE_INFO {
    key: string;
    groupKeys: string[];
    status: NodeStatus;
}
export declare enum TASK_PROCESS_TYPE {
    UPDATE_RUNNING_GRAPH = 1,
    STATUS_CHANGE = 2
}
export declare enum TaskEventType {
    ProcessRunningGraph = "ProcessRunningGraph",
    TaskChange = "TaskChange",
    Init = "Init",
    RdxContextInit = "RdxContextInit",
    EventTrigger = "EventTrigger",
    BatchEventTrigger = "BatchEventTrigger",
    StatusChange = "StatusChange",
    StateChange = "StateChange"
}
export interface IStatusInfo {
    id: string;
    status: NodeStatus;
}
export interface IEdgeCutFlow {
    circle: string[];
    edges: IEdge[];
}
export interface IEdge {
    source: string;
    target: string;
    reasonType: any;
}
export interface ISnapShotTrigger {
    graph?: PointWithWeight[];
    preRunningPoints: (PointWithWeight & {
        status: NodeStatus;
    })[];
    triggerPoints: PointWithWeight[];
    effectPoints: string[];
    conflictPoints: string[];
    currentAllPoints: PointWithWeight[];
    edgeCutFlow: IEdgeCutFlow[];
    currentRunningPoints: PointWithWeight[];
}
export interface ISnapShot extends ISnapShotTrigger {
    type: TaskEventType;
    status: IStatusInfo[];
}
