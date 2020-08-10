import { NodeStatus } from './typings/global';
import { normalizeSingle2Arr } from './utils';
export default class RunningMap {
    constructor(points) {
        this.statusMap = new Map();
        this.points = points;
    }
    createStatusMap() {
        this.points.forEach((point) => {
            this.statusMap.set(point, NodeStatus.IDeal);
        });
    }
    hasPoint(key) {
        return this.points.includes(key);
    }
    setStatus(key, status) {
        this.statusMap.set(key, status);
    }
    batchSetStatus(key, status) {
        const keys = normalizeSingle2Arr(key);
        keys.forEach((current) => {
            this.setStatus(current, status);
        });
    }
    isRunning() {
        return this.getNotFinishPoints().length > 0;
    }
    isFinish(key) {
        if (this.hasPoint(key)) {
            const status = this.statusMap.get(key);
            return !(status === NodeStatus.Waiting || status === NodeStatus.Running);
        }
        else {
            return true;
        }
    }
    isPointRunning(key) {
        if (this.hasPoint(key)) {
            const status = this.statusMap.get(key);
            return status === NodeStatus.Running;
        }
        else {
            return false;
        }
    }
    getAllPointsWtihStatus() {
        return this.points.map((p) => ({
            key: p,
            status: this.statusMap.get(p),
        }));
    }
    getNotFinishPoints() {
        return this.points
            .filter((key) => {
            return !this.isFinish(key);
        })
            .map((item) => ({
            key: item,
            status: this.statusMap.get(item),
        }));
    }
    getRunningPoints() {
        return this.points
            .filter((key) => {
            return this.hasPoint(key) && this.isPointRunning(key);
        })
            .map((item) => ({
            key: item,
            status: this.statusMap.get(item),
        }));
    }
}
