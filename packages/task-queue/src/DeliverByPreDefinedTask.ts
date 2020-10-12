import {
  arr2Map,
  NotifyPoint,
  Graph,
} from '@czwcode/graph-core';
import Base from './base';
import {
  END,
} from './utils';
import {
  ICallbackInfo ,
  ISnapShotTrigger,
  IStatusInfo,
  PointWithWeight,
} from './typings/global';
import ScheduledCore, { CallbackOptions } from './scheduledCore';
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

  deliver(executeTasks: NotifyPoint[]) {
    // downstreamOnly: boolean = false
    // 异常情况兼容
    if (executeTasks.length === 0) {
      return;
    }
    // 获的未运行完成的点
    let { pendingPoints } = this.beforeDeliver(executeTasks);

    const newPendingPoints = this.getTaskByPoints(pendingPoints);
    const graph = new Graph(newPendingPoints);
    const circles = graph.findCycles();
    if (circles.length !== 0) {
      throw new Error('detect circle deps' + JSON.stringify(circles));
    }
    // 传递新触发节点
    this.ee.emit(IEventType.onStart, this.getExecutingStates(executeTasks));

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
    } else {
      // 更新任务
      this.scheduledCore.update(runningPointsWithEndPoint, this.canReuse);
    }

    // 启动任务
    this.scheduledCore.start(
      this.callbackFunction.bind(this, new Graph(newPendingPoints))
    );
  }

  private callbackFunction(
    runningGraph: Graph,
    currentKey: string,
    options: CallbackOptions
  ) {
    if (currentKey === END) {
      // 结束状态
      this.ee.emit(IEventType.onCall, { isEnd: true });
    } else {
      // onCall前的回调
      this.ee.emit(IEventType.onBeforeCall, { currentKey: currentKey });
      const { next, isPause, close } = options;
      // 记录图的运行时状态
      if (currentKey !== null) {
        const curConfig = this.graph.configMap.get(currentKey);
        // 暂停，依赖未准备好的情况，不执行下去
        const onSuccessProcess = () => {
          if (!isPause()) {
            // 设置运行结束状态
            this.graph.setFinish(currentKey);
            // 传递状态
            this.ee.emit(IEventType.onSuccess, {
              currentKey,
            });
            // 执行下一次调度
            next();
          }
        };
        // 当前链路中出现错误了，
        const onErrorProcess = (error: Error) => {
          if (!isPause()) {
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
            this.ee.emit(IEventType.onError, {
              currentKey,
              notFinishPoint,
              errorMsg: errorMsg,
            });
            // 任务执行失败
            console.warn(
              `${currentKey}任务执行失败, depsKeys:${curConfig &&
                JSON.stringify(curConfig.deps)} errorMsg: ${errorMsg}`
            );
            // 关闭任务
            close()
          }
        };
        this.ee.emit(IEventType.onCall, {
          currentKey: currentKey,
          onError: onErrorProcess,
          onSuccess: onSuccessProcess,
          close: close,
          isCancel: () => isPause(),
          isEnd: false,
        } as ICallbackInfo);
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
