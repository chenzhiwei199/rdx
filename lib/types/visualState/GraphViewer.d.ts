/// <reference types="react" />
import { DataPersistSnapShot } from '@czwcode/rdx-plugin-base';
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
export declare const GlobalDepsViewer: ({ width, height, snapShot, }: {
    width?: number;
    height?: number;
    snapShot: any;
}) => JSX.Element;
