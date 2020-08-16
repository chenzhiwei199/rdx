import {
  normalizeSingle2Arr,
  NodeStatus,
  arr2Map,
  TriggerPoint,
  Graph,
} from '@czwcode/graph-core';
import Base from './base';
import { END, cleanConfig, point2WithWeightAdapter } from './utils';
import {
  CallbackInfo as ICallbackInfo,
  ISnapShotTrigger,
  IStatusInfo,
  PointWithWeight,
} from './typings/global';
import ScheduledCore, { ScheduledTask } from './scheduledCore';
import EE from 'eventemitter3';
export interface IError {
  currentKey: string;
  notFinishPoint: string[];
  errorMsg: string;
}
export type ISuccess = ICallbackInfo;
export type IBeforeCall = ISnapShotTrigger;
export type IEventValues = ISuccess | IError | IBeforeCall | IStatusChange;
export type IStatusChange = IStatusInfo;
export enum IEventType {
  onCall = 'onCall',
  onBeforeCall = 'onBeforeCall',
  onError = 'onError',
  onSuccess = 'onSuccess',
  onStart = 'onStart',
  onStatusChange = 'onStatusChange',
}
export default class DeliverByCallback<T> extends Base<PointWithWeight> {
  scheduledCore?: ScheduledCore;
  canReuse?: (id: string) => boolean;
  ee?: EE<IEventType, IEventValues>;
  constructor(config: PointWithWeight[], canReuse?: (id: string) => boolean) {
    super(config);
    this.ee = new EE<IEventType, IEventValues>();
    this.canReuse = canReuse;
  }

  getEE() {
    return this.ee;
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

  deliver(executeTasks: TriggerPoint[]) {
    // downstreamOnly: boolean = false
    // 异常情况兼容
    if (executeTasks.length === 0) {
      return;
    }
    // 获的未运行完成的点
    const notFinish = this.graph.getNotFinishPoints();
    const runningPointsMap = arr2Map(notFinish, (item) => item.key);
    let {
      intersectPoints,
      pendingPoints,
      downStreamPoints,
    } = this.beforeDeliver(executeTasks);
    const triggerPoint = executeTasks[executeTasks.length - 1];
    // 补充触发节点
    if (!pendingPoints.includes(triggerPoint.key)) {
      pendingPoints.push(triggerPoint.key);
    }
    const { points: newPendingPoints, edgeCuts } = cleanConfig(
      this.getTaskByPoints(pendingPoints),
      triggerPoint.key,
      triggerPoint.downStreamOnly
    );

    // 传递新触发节点
    this.ee.emit(IEventType.onStart, {
      graph: this.config,
      preRunningPoints: this.getTaskByPoints(
        notFinish.map((item) => item.key)
      ).map((item) => ({ ...item, status: runningPointsMap[item.key] })),
      triggerPoints: point2WithWeightAdapter(executeTasks),
      effectPoints: downStreamPoints,
      conflictPoints: intersectPoints,
      currentAllPoints: this.getTaskByPoints(pendingPoints),
      edgeCutFlow: edgeCuts,
      currentRunningPoints: point2WithWeightAdapter(newPendingPoints),
    });

    // 构建任务处理器
    const endPoint = {
      id: END,
      deps: newPendingPoints.map((item) => item.key),
    };

    // 没有要执行的任务，终止
    if (newPendingPoints.length === 0) {
      return;
    }

    this.graph.setPending(newPendingPoints.map((item) => item.key));
    const runningPointsWithEndPoint = [
      endPoint,
      ...newPendingPoints.map((item) => ({
        id: item.key,
        deps: (item.deps || []).map((dep) => dep.id),
      })),
    ];
    if (!this.scheduledCore) {
      this.scheduledCore = new ScheduledCore(runningPointsWithEndPoint);
    }
    // 更新任务
    this.scheduledCore.update(runningPointsWithEndPoint, this.canReuse);
    // 启动任务
    this.scheduledCore.start(
      this.callbackFunction.bind(this, new Graph(newPendingPoints))
    );
  }

  private callbackFunction(
    runningGraph: Graph,
    currentKey: string,
    options: { next: () => void; scheduledTask: ScheduledTask }
  ) {
    if (currentKey === END) {
      // 结束状态
      this.ee.emit(IEventType.onCall, { isEnd: true });
    } else {
      // onCall前的回调
      this.ee.emit(IEventType.onBeforeCall, { currentKey: currentKey });
      const { next, scheduledTask } = options;
      // 记录图的运行时状态
      if (currentKey !== null) {
        const curConfig = this.graph.configMap.get(currentKey);
        const onSuccessProcess = () => {
          if (!scheduledTask.isStop()) {
            // 设置运行结束状态
            this.graph.setFinish(currentKey);
            // 传递状态
            this.ee.emit(IEventType.onStatusChange, {
              id: currentKey,
              status: NodeStatus.Finish,
            } as IStatusInfo);
            this.ee.emit(IEventType.onSuccess, {
              currentKey,
            });
            // 执行下一次调度
            next();
          }
        };
        // 当前链路中出现错误了，
        const onErrorProcess = (error: Error) => {
          if (!scheduledTask.isStop()) {
            // 当前分支上未完成的点
            const relationPoints = runningGraph.getAllPointsByPoints({
              key: currentKey,
              downStreamOnly: false,
            });
            const runningPoints = this.getNotFinishPoints();
            const runningPointsMap = arr2Map(runningPoints, (a) => a.key);
            const notFinishPoint = relationPoints.filter((item) =>
              runningPointsMap.has(item)
            );
            // 当前分支上的点置位完成
            notFinishPoint.forEach((p) => {
              this.graph.setFinish(p);
            });
            // 当前分支上的点置位完成
            const errorMsg = error
              ? error.stack
                ? error.stack.toString()
                : error.toString()
              : '运行错误';
            // 传递错误状态
            this.ee.emit(IEventType.onStatusChange, {
              id: currentKey,
              status: NodeStatus.Error,
            } as IStatusInfo);

            this.ee.emit(IEventType.onError, {
              currentKey,
              notFinishPoint,
              errorMsg: errorMsg,
            });
            // 任务执行失败
            console.error(
              `${currentKey}任务执行失败, depsKeys:${curConfig &&
                JSON.stringify(curConfig.deps)} errorMsg: ${errorMsg}`
            );
          }
        };
        this.ee.emit(IEventType.onCall, {
          currentKey: currentKey,
          onError: onErrorProcess,
          onSuccess: onSuccessProcess,
          isCancel: () => scheduledTask.isStop(),
          isEnd: false,
        });
      }
    }
  }
}

function persistPromise() {
  let resolvePersist;
  let rejectPersist;
  const promise = new Promise((resolve, reject) => {
    resolvePersist = resolve;
    rejectPersist = reject;
  });
  return { promise, resolvePersist, rejectPersist };
}
