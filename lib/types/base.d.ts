import { NotifyPoint } from '@czwcode/graph-core';
import { Graph } from '@czwcode/graph-core';
import { PointWithWeight, ISnapShotTrigger } from './typings/global';
export default abstract class BaseQueue<T extends PointWithWeight> {
    config: T[];
    configMap: Map<string, T>;
    running: boolean;
    runningId: string;
    graph: Graph;
    runtimeGraph: Graph;
    constructor(config: T[]);
    updateTasks(config: T[]): void;
    getFirstAllPoints(scope?: string): string[];
    /**
     *
     * @param config 找到所有起点, 规则: 没有依赖，或者依赖全都不在dfsConfig里面
     */
    getFirstPoints(scope?: string): any[];
    getAllPointFired(points: NotifyPoint | NotifyPoint[]): string[];
    isRunning(): boolean;
    getIntersectPoints(downStreamPoints: string[]): string[];
    getNotFinishPoints(): {
        key: string;
        status: import("@czwcode/graph-core").NodeStatus;
    }[];
    /**
     * 获取即将要执行任务
     * @param executeTasks
     * @param downstreamOnly
     */
    getPendingPoints(executeTasks: NotifyPoint[]): string[];
    getTaskByPoints(p: string | string[]): {
        deps: import("./typings/global").IDeps[];
        scope?: string;
        key: string;
    }[];
    cleanInVaildDeps(config: PointWithWeight[]): {
        deps: import("./typings/global").IDeps[];
        scope?: string;
        key: string;
    }[];
    getExecutingStates(executeTask: NotifyPoint | NotifyPoint[]): ISnapShotTrigger;
    getWillExecuteInfo(executeTasks: NotifyPoint | NotifyPoint[]): {
        downStreamPoints: string[];
        intersectPoints: string[];
        pendingPoints: string[];
    };
    beforeDeliver(executeTasks: NotifyPoint | NotifyPoint[]): {
        downStreamPoints: string[];
        intersectPoints: string[];
        pendingPoints: string[];
    };
}
