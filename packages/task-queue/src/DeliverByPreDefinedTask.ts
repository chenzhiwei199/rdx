import {
  normalizeSingle2Arr,
  NodeStatus,
  arr2Map,
  TriggerPoint,
  Graph,
  Point,
} from '@czwcode/graph-core';
import Base from './base';
import {
  END,
  cleanConfig,
  graphLibAdapter,
  point2WithWeightAdapter,
} from './utils';
import {
  Task,
  TaskInfo,
  CallbackInfo,
  ReactionType,
  SYNC_TASK,
  ASYNC_TASK,
  TaskEventType,
  ISnapShotTrigger,
  IStatusInfo,
} from './typings/global';
import ScheduledCore, { ScheduledTask } from './scheduledCore';

export default class DeliverByCallback<T> extends Base<Task<T>> {
  scheduledCore?: ScheduledCore;
  callback: (callbackInfo: CallbackInfo) => void;
  preCallback: (key: string | null) => void;
  errorCallback: (
    currentKey: string,
    notFinishPoint: string[],
    errorMsg: string,
    callbackInfo: CallbackInfo
  ) => void;
  processChange: (
    type: TaskEventType,
    content: ISnapShotTrigger | IStatusInfo
  ) => void;
  constructor(
    config: Task<T>[],
    preCallback: (key: string | null) => void = () => {},
    callback: (callbackInfo: CallbackInfo) => void = () => {},
    errorCallback: (
      currentKey: string,
      notFinishPoint: string[],
      errorMsg: string,
      callbackInfo: CallbackInfo
    ) => void = () => {},
    processChange: (
      type: TaskEventType,
      content: ISnapShotTrigger | IStatusInfo
    ) => void = () => {}
  ) {
    super(config);
    this.callback = callback;
    this.preCallback = preCallback;
    this.errorCallback = errorCallback;
    this.processChange = processChange;
  }

  getTaskByPoints(p: string | string[]) {
    const ps = normalizeSingle2Arr<string>(p);
    const newPs = ps.map((currentP) => this.configMap.get(currentP)) as Task<
      T
    >[];

    return this.cleanInVaildDeps(newPs);
  }

  cleanInVaildDeps(config: Task<T>[]) {
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
    this.processChange(TaskEventType.ProcessRunningGraph, {
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
    } as ISnapShotTrigger);

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
    this.scheduledCore.stop();
    this.scheduledCore.update(runningPointsWithEndPoint);
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
      this.callback({ isEnd: true });
    } else {
      this.preCallback(currentKey);
    }
    const { next, scheduledTask } = options;
    const curConfig = this.graph.configMap.get(currentKey);
    const baseTaskInfo = {
      key: currentKey,
      deps: ((curConfig && curConfig.deps) || []).map((item) => ({
        id: item.id,
      })),
    } as Point;

    // 记录图的运行时状态
    if (currentKey !== null) {
      const curConfig: Task<T> | undefined = (this.graph.configMap.get(
        currentKey
      ) as unknown) as Task<T>;
      const onSuccessProcess = () => {
        if (!scheduledTask.isStop()) {
          // 设置运行结束状态
          this.graph.setFinish(currentKey);
          // 传递状态
          this.processChange(TaskEventType.StatusChange, {
            id: currentKey,
            status: NodeStatus.Finish,
          } as IStatusInfo);
          this.callback({
            currentKey,
            isEnd: false,
          } as CallbackInfo);
          // 执行下一次调度
          next();
        }
      };
      // 当前链路中出现错误了，
      const onErrorProcess = (error: any) => {
        if (!scheduledTask.isStop()) {
          // 所有没完成的点
          const relationPoints = runningGraph.getAllPointsByPoints({
            key: currentKey,
            downStreamOnly: false,
          });
          const runningPoints = this.getNotFinishPoints();
          const runningPointsMap = arr2Map(runningPoints, (a) => a.key);
          const notFinishPoint = relationPoints.filter((item) =>
            runningPointsMap.has(item)
          );
          // 当前任务组下面所有的点
          notFinishPoint.forEach((p) => {
            this.graph.setFinish(p);
          });
          // 传递错误状态
          this.processChange(TaskEventType.StatusChange, {
            id: currentKey,
            status: NodeStatus.Error,
          } as IStatusInfo);

          this.errorCallback(
            currentKey,
            notFinishPoint,
            error ? error.toString() : '运行错误',
            {
              currentKey,
              isEnd: true,
            } as CallbackInfo
          );
          // 任务执行失败
          console.error(
            `${currentKey}任务执行失败, depsKeys:${
              curConfig && curConfig.deps
            } errorMsg: ${error && error.stack && error.stack.toString()}`
          );
        }
      };
      if (curConfig) {
        if (curConfig.taskType === ReactionType.Sync) {
          try {
            (curConfig.task as SYNC_TASK<T>)({
              ...baseTaskInfo,
              isCancel: () => scheduledTask.isStop(),
              next: next,
            } as TaskInfo);
            onSuccessProcess();
          } catch (error) {
            onErrorProcess(error);
          }
        } else {
          (curConfig.task as ASYNC_TASK<T>)({
            ...baseTaskInfo,
            isCancel: () => scheduledTask.isStop(),
            next: next,
          } as TaskInfo)
            .then(onSuccessProcess)
            .catch(onErrorProcess);
        }
      }
    }
  }
}
