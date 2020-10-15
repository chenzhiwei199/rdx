import { NotifyPoint } from '@czwcode/graph-core';
import Base from './base';
import { ICallbackInfo, ISnapShotTrigger, IStatusInfo, PointWithWeight } from './typings/global';
import ScheduledCore from './scheduledCore';
import EE from 'eventemitter3';
export interface IError {
    currentKey: string;
    notFinishPoint: string[];
    errorMsg: string;
}
export declare type ISuccess = ICallbackInfo;
export declare type IBeforeCall = ISnapShotTrigger;
export declare type IEventValues = ISuccess | IError | IBeforeCall | IStatusChange;
export declare type IStatusChange = IStatusInfo;
export declare enum IEventType {
    onCall = "onCall",
    onBeforeCall = "onBeforeCall",
    onError = "onError",
    onSuccess = "onSuccess",
    onStart = "onStart"
}
export default class DeliverByCallback<T> extends Base<PointWithWeight> {
    scheduledCore?: ScheduledCore;
    canReuse?: (id: string) => boolean;
    ee?: EE<IEventType, IEventValues>;
    constructor(config: PointWithWeight[], canReuse?: (id: string) => boolean);
    getEE(): EE<IEventType, IEventValues>;
    deliver(executeTasks: NotifyPoint[]): void;
    private callbackFunction;
}
