import { TriggerPoint, Point } from '@czwcode/graph-core';
import Base from './base';
import { Task, CallbackInfo, ReactionType, TaskEventType, ISnapShotTrigger, IStatusInfo } from './typings/global';
import ScheduledCore from './scheduledCore';
export default class DeliverByCallback<T> extends Base<Task<T>> {
    scheduledCore?: ScheduledCore;
    callback: (callbackInfo: CallbackInfo) => void;
    preCallback: (key: string | null) => void;
    errorCallback: (currentKey: string, notFinishPoint: string[], errorMsg: string, callbackInfo: CallbackInfo) => void;
    processChange: (type: TaskEventType, content: ISnapShotTrigger | IStatusInfo) => void;
    constructor(config: Task<T>[], preCallback?: (key: string | null) => void, callback?: (callbackInfo: CallbackInfo) => void, errorCallback?: (currentKey: string, notFinishPoint: string[], errorMsg: string, callbackInfo: CallbackInfo) => void, processChange?: (type: TaskEventType, content: ISnapShotTrigger | IStatusInfo) => void);
    getTaskByPoints(p: string | string[]): {
        deps: import("./typings/global").IDeps[];
        taskType?: ReactionType;
        task: import("./typings/global").MixedTask<T>;
        reusableDetection?: (taskInfo: Point) => boolean;
        scope?: string;
        key: string;
    }[];
    cleanInVaildDeps(config: Task<T>[]): {
        deps: import("./typings/global").IDeps[];
        taskType?: ReactionType;
        task: import("./typings/global").MixedTask<T>;
        reusableDetection?: (taskInfo: Point) => boolean;
        scope?: string;
        key: string;
    }[];
    deliver(executeTasks: TriggerPoint[]): void;
    private callbackFunction;
}
