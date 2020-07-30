import { NodeStatus } from './typings/global';
import { normalizeSingle2Arr } from './utils';

export default class RunningMap {
  points: string[];
  statusMap: Map<string, NodeStatus> = new Map();
  constructor(points: string[]) {
    this.points = points;
  }
  createStatusMap() {
    this.points.forEach((point) => {
      this.statusMap.set(point, NodeStatus.IDeal);
    });
  }

  hasPoint(key: string) {
    return this.points.includes(key);
  }

  setStatus(key: string, status: NodeStatus) {
    this.statusMap.set(key, status);
  }
  batchSetStatus(key: string | string[], status: NodeStatus) {
    const keys = normalizeSingle2Arr(key);
    keys.forEach((current: string) => {
      this.setStatus(current, status);
    });
  }
  isRunning() {
    return this.getNotFinishPoints().length > 0;
  }

  isFinish(key: string) {
    if (this.hasPoint(key)) {
      const status = this.statusMap.get(key);
      return !(status === NodeStatus.Waiting || status === NodeStatus.Running);
    } else {
      return true;
    }
  }

  isPointRunning(key: string) {
    if (this.hasPoint(key)) {
      const status = this.statusMap.get(key);
      return status === NodeStatus.Running;
    } else {
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
