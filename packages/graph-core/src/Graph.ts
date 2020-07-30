import BaseGraph from './BaseGraph';
import RunningGraph from './runningMap';
import {
  BasePoint,
  Point as T,
  Point,
  RunningPoint,
  NodeStatus,
} from './typings/global';
import { union } from './utils';

export default class Graph extends BaseGraph {
  runningGraph: RunningGraph;
  constructor(config: Point[]) {
    super(config);
    this.runningGraph = new RunningGraph(config.map((item) => item.key));
  }

  udpateRunningGraph(points: Point[]) {
    this.runningGraph = new RunningGraph(points.map((item) => item.key));
  }

  isRunning() {
    return this.runningGraph.isRunning();
  }

  setRunning(key: string | null) {
    if (key) {
      this.runningGraph.setStatus(key as string, NodeStatus.Running);
    }
  }

  setPending(key: string | null | string[]) {
    if (key) {
      this.runningGraph.batchSetStatus(key, NodeStatus.Waiting);
    }
  }

  getAllPointWithStatus() {
    return this.runningGraph.getAllPointsWtihStatus();
  }

  setFinish(key: string | null) {
    if (key) {
      this.runningGraph.batchSetStatus(key, NodeStatus.Finish);
    }
  }

  getCurrentPoints(triggerPoints: BasePoint[]) {
    // 1 运行的图
    const notFinishPoints = this.getNotFinishPoints();
    // 2 触发的新图
    const allTriggerPoints = this.getAllPointsByPoints(triggerPoints);
    // 有运行状态的的节点
    // 3 图点的合并
    const afterUnionGraph = union(
      [...notFinishPoints.map((item) => item.key), ...allTriggerPoints],
      (a) => a
    );
    // 4 返回图
    return afterUnionGraph as string[];
  }

  getNotFinishPoints() {
    return this.runningGraph.getNotFinishPoints();
  }
  getRunningPoints() {
    return this.runningGraph.getRunningPoints();
  }
}
