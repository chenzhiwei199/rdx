import { Point, TriggerPoint, IGraphDeps } from './typings/global';
export declare const GLOBAL_DEPENDENCE_SCOPE = "*";
export interface Edge {
    v: string;
    w: string;
}
export default class BaseGraph {
    config: Point[];
    configMap: Map<string, Point>;
    deliverMap: Map<string, string[]>;
    constructor(config: Point[]);
    sinks(): string[];
    successors(v: string): string[];
    nodes(): string[];
    hasEdge(v: string, w: string): boolean;
    findCycles(): any[];
    edgeValue(v: string, w: string): void;
    inEdges(key: string): {
        v: string;
        w: string;
        value: any;
    }[];
    edge(v: string, w: string): any;
    outEdges(key: string): {
        v: string;
        w: string;
    }[];
    removeEdge(v: string, w: string): {
        deps?: IGraphDeps[];
        scope?: string;
        key: string;
    }[];
    removeNode(key: string): void;
    dfs(k: string, visited: Set<string>, stack: Array<string>): void;
    getRelationConfig(keys: string[]): {
        deps: IGraphDeps[];
        scope?: string;
        key: string;
    }[];
    isAcyclic(): boolean;
    tarjan(): any[];
    updateConfig(config: Point[]): void;
    getConfig(): Point[];
    private cleanInVaildDeps;
    getConfigByScope(scope?: string | null): {
        deps: IGraphDeps[];
        scope?: string;
        key: string;
    }[];
    /**
     * 根据派发关系来找到所有经过的节点
     * 找到当前点关联的所有点(排除除触发点以外作用域外的点)
     * @param newTriggerPoints
     * @param createDeliversMap
     */
    getAllPointsByPoints(triggerPoints: TriggerPoint | TriggerPoint[]): string[];
    /**
     * 根据派发关系来找到所有经过的节点
     * 找到当前点关联的所有点(排除除触发点以外作用域外的点，和 WeakPoint)
     * @param triggerPoints
     * @param createDeliversMap
     */
    getAllPointsByPointByScope: (scope: any) => (triggerPoints: TriggerPoint[]) => string[];
}
