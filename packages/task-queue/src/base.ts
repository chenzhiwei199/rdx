import {
  normalizeSingle2Arr,
  Point,
  createConfigMap,
  GLOBAL_DEPENDENCE_SCOPE,
  Scope,
  NotifyPoint,
  arr2Map,
} from '@czwcode/graph-core';
import { Graph, BasePoint } from '@czwcode/graph-core';
import { graphAdapter, cleanConfig, point2WithWeightAdapter } from './utils';
import { PointWithWeight, ISnapShotTrigger } from './typings/global';

export default abstract class BaseQueue<T extends PointWithWeight> {
  config: T[] = [] as T[];
  configMap: Map<string, T> = new Map();
  running: boolean = false;
  runningId: string = 'none';
  graph: Graph;
  runtimeGraph: Graph;
  constructor(config: T[]) {
    this.runtimeGraph = new Graph([]);
    this.updateTasks(config);
  }

  updateTasks(config: T[]) {
    if (!this.graph) {
      this.graph = new Graph(graphAdapter(config));
    } else {
      this.graph.updateConfig(graphAdapter(config));
    }
    this.config = config.map((item: T) => ({
      ...item,
      scope: item.scope ? item.scope : GLOBAL_DEPENDENCE_SCOPE,
    }));
    this.configMap = createConfigMap(config);
    // 更新全局图
  }
  public getFirstAllPoints(scope?: string) {
    const firstPoints = this.getFirstPoints(scope);
    return this.graph.getAllPointsByPoints(
      firstPoints.map((point) => ({ key: point, scope }))
    );
  }

  /**
   *
   * @param config 找到所有起点, 规则: 没有依赖，或者依赖全都不在dfsConfig里面
   */
  public getFirstPoints(scope?: string) {
    const startPoints = [];
    // 通过作用于过滤点
    const config = this.graph.getConfigByScope(scope);
    if (config.length === 0) {
      return [];
    }
    // 获取去环节点
    const { points: newPendingPoints } = cleanConfig(
      config.map((item) => ({
        ...item,
        deps: (item.deps || []).map((k) => ({ id: k.id })),
      })),
      config[0].key,
      false
    );
    // 无依赖节点
    for (const item of newPendingPoints) {
      const deps = item.deps || [];
      if (deps.length === 0) {
        startPoints.push(item.key);
      }
    }
    return startPoints;
  }

  public getAllPointFired(points: NotifyPoint | NotifyPoint[]) {
    // @ts-ignore
    const newPoints = normalizeSingle2Arr<BasePoint>(points);
    // @ts-ignore
    let p = this.graph.getAllPointsByPoints(newPoints);
    return p;
  }

  isRunning() {
    return this.graph.isRunning();
  }

  getIntersectPoints(downStreamPoints: string[]): string[] {
    const runningPoints = this.graph.getNotFinishPoints();
    const intersectPoints = downStreamPoints.filter((p) => {
      return runningPoints.some((rp) => rp && rp.key === p);
    });
    return intersectPoints;
  }

  getNotFinishPoints() {
    return this.graph.getNotFinishPoints();
  }
  /**
   * 获取即将要执行任务
   * @param executeTasks
   * @param downstreamOnly
   */
  getPendingPoints(executeTasks: NotifyPoint[]) {
    if (!this.graph.isRunning()) {
      return this.graph.getAllPointsByPoints(executeTasks);
    } else {
      return this.graph.getCurrentPoints(executeTasks);
    }
  }

  getTaskByPoints(p: string | string[]) {
    // @ts-ignore
    const ps = normalizeSingle2Arr<string>(p);
    const newPs = ps.map((currentP) =>
      this.configMap.get(currentP)
    ) as PointWithWeight[];

    return this.cleanInVaildDeps(newPs);
  }

  cleanInVaildDeps(config: PointWithWeight[]) {
    const configMap = arr2Map(config, (a) => a && a.key);
    return config.map((item) => ({
      ...item,
      deps: (item.deps || []).filter((dep) => configMap.get(dep.id)),
    }));
  }
  getExecutingStates(executeTask: NotifyPoint | NotifyPoint[]) {
    const executeTasks = normalizeSingle2Arr(executeTask);
    const notFinish = this.graph.getNotFinishPoints();
    const runningPointsMap = arr2Map(notFinish, (item) => item.key);
    let {
      intersectPoints,
      pendingPoints,
      downStreamPoints,
    } = this.getWillExecuteInfo(executeTasks);
    const newPendingPoints = this.getTaskByPoints(pendingPoints);
    return {
      graph: this.config,
      preRunningPoints: this.getTaskByPoints(
        notFinish.map((item) => item.key)
      ).map((item) => ({ ...item, status: runningPointsMap[item.key] })),
      triggerPoints: point2WithWeightAdapter(executeTasks),
      effectPoints: downStreamPoints,
      conflictPoints: intersectPoints,
      currentRunningPoints: point2WithWeightAdapter(newPendingPoints),
    } as ISnapShotTrigger;
  }
  getWillExecuteInfo(executeTasks: NotifyPoint | NotifyPoint[]) {
    // 数据格式类型统一处理
    // @ts-ignore
    const normalizeExecuteTasks = normalizeSingle2Arr<NotifyPoint>(
      executeTasks
    );

    // 获取即将要执行的任务
    let pendingPoints = this.getPendingPoints(normalizeExecuteTasks);

    let downStreamPoints = this.graph.getAllPointsByPoints(
      normalizeExecuteTasks
    );
    // 构建运行时图
    const intersectPoints = this.getIntersectPoints(downStreamPoints);

    return { downStreamPoints, intersectPoints, pendingPoints };
  }
  beforeDeliver(executeTasks: NotifyPoint | NotifyPoint[]) {
    const {
      downStreamPoints,
      intersectPoints,
      pendingPoints,
    } = this.getWillExecuteInfo(executeTasks);
    const pendingConfig = this.config.filter((rowConfig) =>
      pendingPoints.includes(rowConfig.key)
    );
    // 设置当前任务流的节点状态
    this.graph.udpateRunningGraph(graphAdapter(pendingConfig));

    return { downStreamPoints, intersectPoints, pendingPoints };
  }
}
