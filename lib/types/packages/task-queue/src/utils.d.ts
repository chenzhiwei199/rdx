import { PointWithWeight, IEdgeCutFlow, IDeps } from './typings/global';
import { Point, Graph, Edge } from '@czwcode/graph-core';
export declare const END = "i am i end subscribe, hahaha";
export declare const createGraphByGraphAndCircle: (graph: Graph, circle: string[]) => Graph;
export declare const findNotMaxWidgetEdge: (edges: Edge[]) => Edge[];
export declare const findSameArray: (sourceArr: string[], targetArr: string[]) => string;
export declare enum ReasonType {
    TriggerInnEdge = "TriggerInnEdge",
    SmallWeight = "SmallWeight",
    WeightEqualAndNotFirst = "WeightEqualAndNotFirst"
}
export declare function cleanConfig(p: PointWithWeight[], triggerKey?: string, donwStream?: boolean): {
    points: Point[];
    edgeCuts: IEdgeCutFlow[];
};
export declare function removeCircleEdges(rootGraph: Graph, currentGraph: Graph, triggerKey?: string, edgeCuts?: IEdgeCutFlow[]): void;
export declare function graphAdapter(pointWithWeight: PointWithWeight[]): {
    deps: ({
        id: never;
        value?: undefined;
    } | {
        id: string;
        value: {
            weight?: number;
        };
    })[];
    scope?: string;
    key: string;
}[];
export declare function point2WithWeightAdapter(pointWithWeight: Point[]): {
    id: string;
    deps: {
        id: string;
    }[];
    scope?: string;
    key: string;
}[];
export declare function graphLibAdapter(pointWithWeight: PointWithWeight[]): {
    id: string;
    deps: IDeps[];
    scope?: string;
    key: string;
}[];
