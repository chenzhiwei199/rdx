var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
import { Graph } from '@czwcode/graph-core';
export const END = 'i am i end subscribe, hahaha';
export const createGraphByGraphAndCircle = (graph, circle) => {
    const config = graph.getRelationConfig(circle);
    return new Graph(config);
};
export const findNotMaxWidgetEdge = (edges) => {
    let max = -1;
    let maxIndex = -1;
    edges.forEach((item, index) => {
        const { value } = item;
        if (value.weight > max) {
            max = value.weight;
            maxIndex = index;
        }
    });
    if (maxIndex === -1) {
        return null;
    }
    else {
        return [...edges.slice(0, maxIndex), ...edges.slice(maxIndex + 1)];
    }
};
export const findSameArray = (sourceArr, targetArr) => {
    return targetArr.find((item) => sourceArr.includes(item));
};
export var ReasonType;
(function (ReasonType) {
    ReasonType["TriggerInnEdge"] = "TriggerInnEdge";
    ReasonType["SmallWeight"] = "SmallWeight";
    ReasonType["WeightEqualAndNotFirst"] = "WeightEqualAndNotFirst";
})(ReasonType || (ReasonType = {}));
export function cleanConfig(p, triggerKey, donwStream) {
    const edgeCuts = [];
    const graph = new Graph(graphAdapter(p));
    try {
        removeCircleEdges(graph, graph, triggerKey, edgeCuts);
        if (donwStream === true) {
            graph.removeNode(triggerKey);
        }
    }
    catch (error) {
        console.error(error);
    }
    return {
        points: graph.config,
        edgeCuts: edgeCuts,
    };
}
export function removeCircleEdges(rootGraph, currentGraph, triggerKey, edgeCuts) {
    const circles = rootGraph.findCycles();
    if (circles.length === 0) {
        return;
    }
    // 找路径，找到环的切入点
    const path = currentGraph.getAllPointsByPoints({
        key: triggerKey,
        downStreamOnly: false,
    });
    circles.forEach((circle) => {
        let circleTriggerKey = findSameArray(circle, path);
        if (!circleTriggerKey) {
            circleTriggerKey = circle[0];
        }
        // 构建环的图
        const circleGraph = createGraphByGraphAndCircle(currentGraph, circle);
        const edgeCut = {
            circle: circle,
            edges: [],
        };
        function removeEdge({ v, w }) {
            circleGraph.removeEdge(v, w);
            rootGraph.removeEdge(v, w);
        }
        function appendEdgeCuts(edges) {
            edgeCut.edges = [...edgeCut.edges, ...edges];
        }
        // 清理环里面所有入度
        const inEdges = circleGraph.inEdges(circleTriggerKey);
        if (inEdges) {
            const inEdgesInCircle = inEdges;
            inEdgesInCircle.forEach((edge) => {
                removeEdge(edge);
            });
            appendEdgeCuts(inEdgesInCircle.map((item) => ({
                source: item.v,
                target: item.w,
                reasonType: ReasonType.TriggerInnEdge,
            })));
        }
        // 留下权重最高的边
        const outEdges = rootGraph.outEdges(circleTriggerKey);
        if (outEdges) {
            const willCutEdges = findNotMaxWidgetEdge(outEdges.map((item) => (Object.assign(Object.assign({}, item), { value: rootGraph.edge(item.v, item.w) }))));
            if (willCutEdges) {
                willCutEdges.forEach((edge) => {
                    removeEdge(edge);
                });
                appendEdgeCuts(willCutEdges.map((item) => ({
                    source: item.v,
                    target: item.w,
                    reasonType: ReasonType.SmallWeight,
                })));
            }
            else {
                const others = outEdges.slice(1);
                others.forEach((edge) => {
                    removeEdge(edge);
                });
                appendEdgeCuts(others.map((item) => ({
                    source: item.v,
                    target: item.w,
                    reasonType: ReasonType.WeightEqualAndNotFirst,
                })));
            }
        }
        edgeCuts.push(edgeCut);
        removeCircleEdges(rootGraph, circleGraph, circleTriggerKey, edgeCuts);
    });
}
export function graphAdapter(pointWithWeight) {
    return pointWithWeight.map((p) => {
        return Object.assign(Object.assign({}, p), { deps: (p.deps || []).map((dep) => {
                if (typeof dep === 'string') {
                    return {
                        id: dep,
                    };
                }
                else {
                    const { id } = dep, others = __rest(dep, ["id"]);
                    return {
                        id: dep.id,
                        value: others,
                    };
                }
            }) });
    });
}
export function point2WithWeightAdapter(pointWithWeight) {
    return pointWithWeight.map((p) => {
        return Object.assign(Object.assign({}, p), { id: p.key, deps: (p.deps || []).map((dep) => {
                return {
                    id: dep.id,
                };
            }) });
    });
}
export function graphLibAdapter(pointWithWeight) {
    return pointWithWeight.map((p) => {
        return Object.assign(Object.assign({}, p), { id: p.key, deps: (p.deps || []).map((dep) => {
                if (typeof dep === 'string') {
                    return {
                        id: dep,
                    };
                }
                else {
                    return dep;
                }
            }) });
    });
}
