import { PointWithWeight, IEdgeCutFlow, IEdge, IDeps } from './typings/global';
import { Point, Graph, Edge, IGraphDeps } from '@czwcode/graph-core';

export const END = 'i am i end subscribe, hahaha';

export const createGraphByGraphAndCircle = (graph: Graph, circle: string[]) => {
  const config = graph.getRelationConfig(circle);
  return new Graph(config);
};

export const findNotMaxWidgetEdge = (edges: Edge[]) => {
  let max = -1;
  let maxIndex = -1;
  edges.forEach((item: any, index) => {
    const { value } = item;
    if (value.weight > max) {
      max = value.weight;
      maxIndex = index;
    }
  });
  if (maxIndex === -1) {
    return null;
  } else {
    return [...edges.slice(0, maxIndex), ...edges.slice(maxIndex + 1)];
  }
};
export const findSameArray = (sourceArr: string[], targetArr: string[]) => {
  return targetArr.find((item) => sourceArr.includes(item));
};
export enum ReasonType {
  TriggerInnEdge = 'TriggerInnEdge',
  SmallWeight = 'SmallWeight',
  WeightEqualAndNotFirst = 'WeightEqualAndNotFirst',
}
export function cleanConfig(
  p: PointWithWeight[],
  triggerKey?: string,
  donwStream?: boolean
) {
  const edgeCuts = [] as IEdgeCutFlow[];
  const graph = new Graph(graphAdapter(p));
  try {
    removeCircleEdges(graph, graph, triggerKey, edgeCuts);
    if (donwStream === true) {
      graph.removeNode(triggerKey);
    }
  } catch (error) {
    console.error(error);
  }

  return {
    points: graph.config,
    edgeCuts: edgeCuts,
  };
}
export function removeCircleEdges(
  rootGraph: Graph,
  currentGraph: Graph,
  triggerKey?: string,
  edgeCuts?: IEdgeCutFlow[]
) {
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
    const edgeCut: IEdgeCutFlow = {
      circle: circle,
      edges: [],
    };
    function removeEdge({ v, w }) {
      circleGraph.removeEdge(v, w);
      rootGraph.removeEdge(v, w);
    }
    function appendEdgeCuts(edges: IEdge[]) {
      edgeCut.edges = [...edgeCut.edges, ...edges];
    }

    // 清理环里面所有入度
    const inEdges = circleGraph.inEdges(circleTriggerKey);
    if (inEdges) {
      const inEdgesInCircle = inEdges;
      inEdgesInCircle.forEach((edge) => {
        removeEdge(edge);
      });
      appendEdgeCuts(
        inEdgesInCircle.map((item) => ({
          source: item.v,
          target: item.w,
          reasonType: ReasonType.TriggerInnEdge,
        }))
      );
    }

    // 留下权重最高的边
    const outEdges = rootGraph.outEdges(circleTriggerKey);
    if (outEdges) {
      const willCutEdges = findNotMaxWidgetEdge(
        outEdges.map((item) => ({
          ...item,
          value: rootGraph.edge(item.v, item.w),
        }))
      );
      if (willCutEdges) {
        willCutEdges.forEach((edge) => {
          removeEdge(edge);
        });
        appendEdgeCuts(
          willCutEdges.map((item) => ({
            source: item.v,
            target: item.w,
            reasonType: ReasonType.SmallWeight,
          }))
        );
      } else {
        const others = outEdges.slice(1);
        others.forEach((edge) => {
          removeEdge(edge);
        });
        appendEdgeCuts(
          others.map((item) => ({
            source: item.v,
            target: item.w,
            reasonType: ReasonType.WeightEqualAndNotFirst,
          }))
        );
      }
    }
    edgeCuts.push(edgeCut);
    removeCircleEdges(rootGraph, circleGraph, circleTriggerKey, edgeCuts);
  });
}

export function graphAdapter(pointWithWeight: PointWithWeight[]) {
  return pointWithWeight.map((p) => {
    return {
      ...p,
      deps: (p.deps || ([] as IDeps[])).map((dep) => {
        if (typeof dep === 'string') {
          return {
            id: dep,
          };
        } else {
          const { id, ...others } = dep;
          return {
            id: dep.id,
            value: others,
          };
        }
      }),
    };
  });
}

export function point2WithWeightAdapter(pointWithWeight: Point[]) {
  return pointWithWeight.map((p) => {
    return {
      ...p,
      id: p.key,
      deps: (p.deps || ([] as IGraphDeps[])).map((dep) => {
        return {
          id: dep.id,
        };
      }),
    };
  });
}

export function graphLibAdapter(pointWithWeight: PointWithWeight[]) {
  return pointWithWeight.map((p) => {
    return {
      ...p,
      id: p.key,
      deps: (p.deps || ([] as { id: string; weight: number }[])).map((dep) => {
        if (typeof dep === 'string') {
          return {
            id: dep,
          };
        } else {
          return dep;
        }
      }),
    };
  });
}
