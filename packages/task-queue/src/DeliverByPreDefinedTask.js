import { normalizeSingle2Arr, NodeStatus, arr2Map, Graph, } from '@czwcode/graph-core';
import Base from './base';
import { END, cleanConfig, point2WithWeightAdapter, } from './utils';
import { ReactionType, TaskEventType, } from './typings/global';
import ScheduledCore from './scheduledCore';
export default class DeliverByCallback extends Base {
    constructor(config, preCallback = () => { }, callback = () => { }, errorCallback = () => { }, processChange = () => { }) {
        super(config);
        this.callback = callback;
        this.preCallback = preCallback;
        this.errorCallback = errorCallback;
        this.processChange = processChange;
    }
    getTaskByPoints(p) {
        // @ts-ignore
        const ps = normalizeSingle2Arr(p);
        const newPs = ps.map((currentP) => this.configMap.get(currentP));
        return this.cleanInVaildDeps(newPs);
    }
    cleanInVaildDeps(config) {
        const configMap = arr2Map(config, (a) => a && a.key);
        return config.map((item) => (Object.assign(Object.assign({}, item), { deps: (item.deps || []).filter((dep) => configMap.get(dep.id)) })));
    }
    deliver(executeTasks) {
        // downstreamOnly: boolean = false
        // 异常情况兼容
        if (executeTasks.length === 0) {
            return;
        }
        const notFinish = this.graph.getNotFinishPoints();
        const runningPointsMap = arr2Map(notFinish, (item) => item.key);
        let { intersectPoints, pendingPoints, downStreamPoints, } = this.beforeDeliver(executeTasks);
        const triggerPoint = executeTasks[executeTasks.length - 1];
        // 补充触发节点
        if (!pendingPoints.includes(triggerPoint.key)) {
            pendingPoints.push(triggerPoint.key);
        }
        const { points: newPendingPoints, edgeCuts } = cleanConfig(this.getTaskByPoints(pendingPoints), triggerPoint.key, triggerPoint.downStreamOnly);
        // 传递新触发节点
        this.processChange(TaskEventType.ProcessRunningGraph, {
            graph: this.config,
            preRunningPoints: this.getTaskByPoints(notFinish.map((item) => item.key)).map((item) => (Object.assign(Object.assign({}, item), { status: runningPointsMap[item.key] }))),
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
        this.scheduledCore.stop();
        this.scheduledCore.update(runningPointsWithEndPoint);
        this.scheduledCore.start(this.callbackFunction.bind(this, new Graph(newPendingPoints)));
    }
    callbackFunction(runningGraph, currentKey, options) {
        if (currentKey === END) {
            this.callback({ isEnd: true });
        }
        else {
            this.preCallback(currentKey);
        }
        const { next, scheduledTask } = options;
        const curConfig = this.graph.configMap.get(currentKey);
        const baseTaskInfo = {
            key: currentKey,
            deps: ((curConfig && curConfig.deps) || []).map((item) => ({
                id: item.id,
            })),
        };
        // 记录图的运行时状态
        if (currentKey !== null) {
            const curConfig = this.graph.configMap.get(currentKey);
            const onSuccessProcess = () => {
                if (!scheduledTask.isStop()) {
                    // 设置运行结束状态
                    this.graph.setFinish(currentKey);
                    // 传递状态
                    this.processChange(TaskEventType.StatusChange, {
                        id: currentKey,
                        status: NodeStatus.Finish,
                    });
                    this.callback({
                        currentKey,
                        isEnd: false,
                    });
                    // 执行下一次调度
                    next();
                }
            };
            // 当前链路中出现错误了，
            const onErrorProcess = (error) => {
                if (!scheduledTask.isStop()) {
                    // 所有没完成的点
                    const relationPoints = runningGraph.getAllPointsByPoints({
                        key: currentKey,
                        downStreamOnly: false,
                    });
                    const runningPoints = this.getNotFinishPoints();
                    const runningPointsMap = arr2Map(runningPoints, (a) => a.key);
                    const notFinishPoint = relationPoints.filter((item) => runningPointsMap.has(item));
                    // 当前任务组下面所有的点
                    notFinishPoint.forEach((p) => {
                        this.graph.setFinish(p);
                    });
                    // 传递错误状态
                    this.processChange(TaskEventType.StatusChange, {
                        id: currentKey,
                        status: NodeStatus.Error,
                    });
                    this.errorCallback(currentKey, notFinishPoint, error ? error.toString() : '运行错误', {
                        currentKey,
                        isEnd: true,
                    });
                    // 任务执行失败
                    console.error(`${currentKey}任务执行失败, depsKeys:${curConfig &&
                        curConfig.deps} errorMsg: ${error &&
                        error.stack &&
                        error.stack.toString()}`);
                }
            };
            if (curConfig) {
                if (curConfig.taskType === ReactionType.Sync) {
                    try {
                        curConfig.task(Object.assign(Object.assign({}, baseTaskInfo), { isCancel: () => scheduledTask.isStop(), next: next }));
                        onSuccessProcess();
                    }
                    catch (error) {
                        onErrorProcess(error);
                    }
                }
                else {
                    curConfig.task(Object.assign(Object.assign({}, baseTaskInfo), { isCancel: () => scheduledTask.isStop(), next: next }))
                        .then(onSuccessProcess)
                        .catch(onErrorProcess);
                }
            }
        }
    }
}
