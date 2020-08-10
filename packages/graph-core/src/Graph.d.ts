import BaseGraph from './BaseGraph';
import RunningGraph from './runningMap';
import { BasePoint, Point, NodeStatus } from './typings/global';
export default class Graph extends BaseGraph {
    runningGraph: RunningGraph;
    constructor(config: Point[]);
    udpateRunningGraph(points: Point[]): void;
    isRunning(): boolean;
    setRunning(key: string | null): void;
    setPending(key: string | null | string[]): void;
    getAllPointWithStatus(): {
        key: string;
        status: NodeStatus;
    }[];
    setFinish(key: string | null): void;
    getCurrentPoints(triggerPoints: BasePoint[]): string[];
    getNotFinishPoints(): {
        key: string;
        status: NodeStatus;
    }[];
    getRunningPoints(): {
        key: string;
        status: NodeStatus;
    }[];
}
