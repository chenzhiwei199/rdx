import * as React from 'react';
import { TaskEventType, NodeStatus, ShareContextClass, IStateInfo, IStatusInfo, IRdxSnapShotTrigger } from '@czwcode/rdx';
export interface ISnapShot extends IRdxSnapShotTrigger {
    type: TaskEventType;
    status: IStatusInfo[];
}
export declare enum DISPLAY_STATE {
    CANCEL = "CANCEL",
    CONFLICT = "CONFLICT"
}
export declare const stateColors: {
    Error: string;
    Watting: string;
    Finish: string;
    IDeal: string;
    CANCEL: string;
    CONFLICT: string;
    init: string;
};
export declare const stateLabel: {
    init: string;
    Error: string;
    Watting: string;
    Finish: string;
    CANCEL: string;
    CONFLICT: string;
};
export interface IGraph<IModel> {
    context: ShareContextClass;
}
export declare enum GraphType {
    Global = "Global",
    PreRunning = "PreRunning",
    Trigger = "Trigger",
    EffectPoints = "EffectPoints",
    ConflictPoints = "ConflictPoints",
    AllPointsNow = "AllPointsNow",
    RunnningPointsNotCut = "RunnningPointsNotCut",
    BuildDAG = "BuildDAG",
    RunnningPointsCut = "RunnningPointsCut"
}
export interface IGraphState {
    version: number;
    visible: boolean;
    statusVersion: number;
}
export interface DataPersistSnapShot extends ISnapShot {
    states: IStateInfo[];
}
export interface IDataPersistenData {
    realTimeState: any;
    allSnapShots: DataPersistSnapShot[];
    snapShots: DataPersistSnapShot[];
    temporarySnapShots: DataPersistSnapShot;
}
declare const DataPersistenceHook: (shareContext?: React.Context<ShareContextClass>) => {
    realTimeState: any;
    allSnapShots: DataPersistSnapShot[];
    snapShots: DataPersistSnapShot[];
    temporarySnapShots: DataPersistSnapShot;
    clear: () => void;
};
export default DataPersistenceHook;
