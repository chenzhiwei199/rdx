import { NodeStatus, BasePoint, Point } from '@czwcode/graph-core';
export declare type Callback = (currentKey: string | null, isRouterEnd: boolean, isCancel: () => boolean, next: () => void) => void;
export declare type BaseCallback = (currentKey: string, next: () => void) => void;
export declare type ASYNC_TASK = (taskInfo: TaskInfo) => Promise<void>;
export declare type SYNC_TASK = (taskInfo: TaskInfo) => void;
export declare type MixedTask = ASYNC_TASK | SYNC_TASK;
export interface IDeps {
    id: string;
    weight?: number;
}
export interface PointWithWeight extends BasePoint {
    deps?: IDeps[];
}
export interface TaskInfo extends Point {
    isCancel: () => boolean;
    next: () => void;
}
export interface ICallbackInfo {
    currentKey?: string | null;
    isEnd?: boolean;
    close: () => void;
    onError?: (error: Error) => void;
    onSuccess?: () => void;
    isCancel?: () => boolean;
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
export declare enum TaskEventTriggerType {
    TriggerByTaskInit = "TriggerByTaskInit",
    DepsUpdate = "DepsUpdate",
    BatchEventTrigger = "BatchEventTrigger",
    BatchReactionOnMount = "BatchReactionOnMount",
    Reset = "Reset",
    ResetById = "ResetById",
    TaskCreated = "TaskCreated",
    Set = "Set"
}
export declare enum TaskEventType {
    Trigger = "Trigger",
    TaskLoad = "TaskLoad",
    Initializing = "Initializing",
    InitEnd = "InitEnd",
    UserAction = "UserAction",
    UserActionEnd = "UserActionEnd",
    TaskExecutingEnd = "TaskExecutingEnd",
    RdxContextInit = "RdxContextInit",
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
    currentRunningPoints: PointWithWeight[];
}
