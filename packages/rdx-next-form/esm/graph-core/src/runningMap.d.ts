import { NodeStatus } from './typings/global';
export default class RunningMap {
    points: string[];
    statusMap: Map<string, NodeStatus>;
    constructor(points: string[]);
    createStatusMap(): void;
    hasPoint(key: string): boolean;
    setStatus(key: string, status: NodeStatus): void;
    batchSetStatus(key: string | string[], status: NodeStatus): void;
    isRunning(): boolean;
    isFinish(key: string): boolean;
    isPointRunning(key: string): boolean;
    getAllPointsWtihStatus(): {
        key: string;
        status: NodeStatus;
    }[];
    getNotFinishPoints(): {
        key: string;
        status: NodeStatus;
    }[];
    getRunningPoints(): {
        key: string;
        status: NodeStatus;
    }[];
}
