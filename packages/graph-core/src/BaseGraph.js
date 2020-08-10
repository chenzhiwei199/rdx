import { createDeliversMap, createConfigMap, normalizeSingle2Arr, union, } from './utils';
export const GLOBAL_DEPENDENCE_SCOPE = '*';
export default class BaseGraph {
    constructor(config) {
        /**
         * 根据派发关系来找到所有经过的节点
         * 找到当前点关联的所有点(排除除触发点以外作用域外的点，和 WeakPoint)
         * @param triggerPoints
         * @param createDeliversMap
         */
        this.getAllPointsByPointByScope = (scope) => {
            const vaildConfig = this.getConfigByScope(scope);
            const validConfigDevlierMap = createDeliversMap(vaildConfig);
            return (triggerPoints) => {
                const recordSet = new Set();
                const traverseDirtySet = new Set();
                function traverse(triggerPoints) {
                    triggerPoints.forEach((triggerPoint) => {
                        if (!triggerPoint.downStreamOnly) {
                            if (!recordSet.has(triggerPoint.key)) {
                                recordSet.add(triggerPoint.key);
                            }
                        }
                        const currentDeliverConfig = validConfigDevlierMap.get(triggerPoint.key);
                        if (currentDeliverConfig) {
                            const willTraversePoint = currentDeliverConfig
                                .filter((item) => !traverseDirtySet.has(item))
                                .map((item) => ({ key: item, downStreamOnly: false }));
                            traverseDirtySet.add(triggerPoint.key);
                            traverse(willTraversePoint);
                        }
                    });
                }
                traverse(triggerPoints);
                return Array.from(recordSet);
            };
        };
        this.updateConfig(config);
    }
    sinks() {
        return this.config
            .filter((item) => (item.deps || []).length === 0)
            .map((item) => item.key);
    }
    successors(v) {
        return this.deliverMap.get(v) || [];
    }
    nodes() {
        return this.config.map((item) => item.key);
    }
    hasEdge(v, w) {
        return (this.deliverMap.get(v) || []).includes(w);
    }
    findCycles() {
        return this.tarjan().filter((cmpt) => {
            return (cmpt.length > 1 || (cmpt.length === 1 && this.hasEdge(cmpt[0], cmpt[0])));
        });
    }
    edgeValue(v, w) {
        this.deliverMap;
    }
    inEdges(key) {
        return (this.configMap.get(key).deps || []).map((item) => ({
            v: item.id,
            w: key,
            value: this.configMap.get(key).deps.find((dep) => dep.id === item.id)
                .value,
        }));
    }
    edge(v, w) {
        return ((this.configMap.get(w).deps || []).find((item) => item.id === v) || {}).value;
    }
    outEdges(key) {
        return (this.deliverMap.get(key) || []).map((item) => ({
            v: key,
            w: item,
        }));
    }
    removeEdge(v, w) {
        const newConfig = this.config.map((item) => {
            if (item.key === w) {
                return Object.assign(Object.assign({}, item), { deps: item.deps.filter((dep) => dep.id !== v) });
            }
            else {
                return Object.assign({}, item);
            }
        });
        this.updateConfig(newConfig);
        return newConfig;
    }
    removeNode(key) {
        // 删除节点
        this.config = this.config
            .filter((item) => item.key !== key)
            .map((item) => {
            return Object.assign(Object.assign({}, item), { deps: (item.deps || []).filter((dep) => dep.id !== key) });
        });
        this.updateConfig(this.config);
    }
    dfs(k, visited, stack) {
        visited.add(k);
        stack.push(k);
        this.successors(k).forEach((successorKey) => {
            if (!visited.has(successorKey)) {
                this.dfs(successorKey, visited, stack);
            }
            else {
                stack.push(k);
            }
        });
    }
    getRelationConfig(keys) {
        const config = this.config.filter((item) => keys.includes(item.key));
        return this.cleanInVaildDeps(config);
    }
    isAcyclic() {
        let visited = new Set();
        let stack = [];
        this.sinks().forEach((k) => {
            this.dfs(k, visited, stack);
        });
        return visited.size < stack.length;
    }
    tarjan() {
        var index = 0;
        var stack = [];
        var visited = {}; // node id -> { onStack, lowlink, index }
        var results = [];
        function isVisited(w) {
            return Boolean(visited[w]);
        }
        const dfs = (v) => {
            var entry = (visited[v] = {
                onStack: true,
                lowlink: index,
                index: index++,
            });
            stack.push(v);
            this.successors(v).forEach(function (w) {
                if (!isVisited(w)) {
                    dfs(w);
                    entry.lowlink = Math.min(entry.lowlink, visited[w].lowlink);
                }
                else if (visited[w].onStack) {
                    entry.lowlink = Math.min(entry.lowlink, visited[w].index);
                }
            });
            if (entry.lowlink === entry.index) {
                var cmpt = [];
                var w;
                do {
                    w = stack.pop();
                    visited[w].onStack = false;
                    cmpt.push(w);
                } while (v !== w);
                results.push(cmpt);
            }
        };
        this.nodes().forEach(function (v) {
            if (!isVisited(v)) {
                dfs(v);
            }
        });
        return results;
    }
    updateConfig(config) {
        this.config = config;
        this.configMap = createConfigMap(config);
        this.deliverMap = createDeliversMap(config);
    }
    getConfig() {
        return this.config;
    }
    cleanInVaildDeps(config) {
        const configMap = createConfigMap(config);
        return config.map((item) => (Object.assign(Object.assign({}, item), { deps: (item.deps || []).filter((dep) => configMap.get(dep.id)) })));
    }
    getConfigByScope(scope) {
        let config;
        if (!scope || scope === GLOBAL_DEPENDENCE_SCOPE) {
            config = this.config;
        }
        else {
            config = this.config.filter((item) => item.scope === scope);
        }
        return this.cleanInVaildDeps(config);
    }
    /**
     * 根据派发关系来找到所有经过的节点
     * 找到当前点关联的所有点(排除除触发点以外作用域外的点)
     * @param newTriggerPoints
     * @param createDeliversMap
     */
    getAllPointsByPoints(triggerPoints) {
        // 非数组，处理成数组
        // @ts-ignore
        const newTriggerPoints = normalizeSingle2Arr(triggerPoints);
        // 去除无效点
        const validPoints = [];
        newTriggerPoints.forEach((cursor, index) => {
            const newCursor = Object.assign({}, cursor);
            const findIndex = validPoints.findIndex((item) => item.key === cursor.key);
            if (findIndex !== -1) {
                if (!cursor.scope || cursor.scope === GLOBAL_DEPENDENCE_SCOPE) {
                    newCursor.scope = GLOBAL_DEPENDENCE_SCOPE;
                }
                if (!cursor.downStreamOnly) {
                    newCursor.downStreamOnly = false;
                }
            }
            validPoints.push(newCursor);
        });
        // 字段分类
        const classficationPointsByScope = new Map();
        validPoints.forEach((item) => {
            const getPointsByScope = classficationPointsByScope.get(item.scope);
            if (classficationPointsByScope.has(item.scope)) {
                getPointsByScope.push(item);
            }
            else {
                classficationPointsByScope.set(item.scope, [item]);
            }
        });
        let allPoints = [];
        Array.from(classficationPointsByScope.keys()).forEach((scope) => {
            allPoints = allPoints.concat(this.getAllPointsByPointByScope(scope)(classficationPointsByScope.get(scope)));
        });
        // @ts-ignore
        allPoints = union(allPoints, (p) => {
            return p;
        });
        return allPoints;
    }
}
function CycleException() { }
CycleException.prototype = new Error(); // must be an instance of Error to pass testing
