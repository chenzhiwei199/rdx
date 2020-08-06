import { normalizeSingle2Arr, createConfigMap, GLOBAL_DEPENDENCE_SCOPE, } from '@czwcode/graph-core';
import { Graph } from '@czwcode/graph-core';
import { graphAdapter, cleanConfig } from './utils';
export default class BaseQueue {
    constructor(config) {
        this.config = [];
        this.configMap = new Map();
        this.running = false;
        this.runningId = 'none';
        this.runtimeGraph = new Graph([]);
        this.updateTasks(config);
    }
    updateTasks(config) {
        if (!this.graph) {
            this.graph = new Graph(graphAdapter(config));
        }
        else {
            this.graph.updateConfig(graphAdapter(config));
        }
        this.config = config.map((item) => (Object.assign(Object.assign({}, item), { scope: item.scope ? item.scope : GLOBAL_DEPENDENCE_SCOPE })));
        this.configMap = createConfigMap(config);
        // 更新全局图
    }
    getFirstAllPoints(scope) {
        const firstPoints = this.getFirstPoints(scope);
        return this.graph.getAllPointsByPoints(firstPoints.map((point) => ({ key: point, scope })));
    }
    /**
     *
     * @param config 找到所有起点, 规则: 没有依赖，或者依赖全都不在dfsConfig里面
     */
    getFirstPoints(scope) {
        const startPoints = [];
        // 通过作用于过滤点
        const config = this.graph.getConfigByScope(scope);
        if (config.length === 0) {
            return [];
        }
        // 获取去环节点
        const { points: newPendingPoints } = cleanConfig(config.map((item) => (Object.assign(Object.assign({}, item), { deps: (item.deps || []).map((k) => ({ id: k.id })) }))), config[0].key, false);
        // 无依赖节点
        for (const item of newPendingPoints) {
            const deps = item.deps || [];
            if (deps.length === 0) {
                startPoints.push(item.key);
            }
        }
        return startPoints;
    }
    getAllPointFired(points) {
        // @ts-ignore
        const newPoints = normalizeSingle2Arr(points);
        // @ts-ignore
        let p = this.graph.getAllPointsByPoints(newPoints);
        return p;
    }
    isRunning() {
        return this.graph.isRunning();
    }
    getIntersectPoints(downStreamPoints) {
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
    getPendingPoints(executeTasks) {
        if (!this.graph.isRunning()) {
            return this.graph.getAllPointsByPoints(executeTasks);
        }
        else {
            return this.graph.getCurrentPoints(executeTasks);
        }
    }
    beforeDeliver(executeTasks) {
        // 数据格式类型统一处理
        // @ts-ignore
        const normalizeExecuteTasks = normalizeSingle2Arr(executeTasks);
        // 获取即将要执行的任务
        let pendingPoints = this.getPendingPoints(normalizeExecuteTasks);
        let downStreamPoints = this.graph.getAllPointsByPoints(normalizeExecuteTasks);
        // 构建运行时图
        const intersectPoints = this.getIntersectPoints(downStreamPoints);
        const pendingConfig = this.config.filter((rowConfig) => pendingPoints.includes(rowConfig.key));
        // 设置当前任务流的节点状态
        this.graph.udpateRunningGraph(graphAdapter(pendingConfig));
        return { downStreamPoints, intersectPoints, pendingConfig, pendingPoints };
    }
}
