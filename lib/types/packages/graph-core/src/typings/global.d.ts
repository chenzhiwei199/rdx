export interface BasePoint {
    scope?: Scope;
    key: string;
}
export interface RunningSetInterface {
    add(point: BasePoint): void;
    remove(key: string): void;
    has(key: string): void;
    get(): BasePoint[];
}
export interface IGraphDeps {
    id: string;
    value?: any;
}
export interface NotifyPoint extends BasePoint {
    downStreamOnly?: boolean;
}
export interface Point extends BasePoint {
    deps?: IGraphDeps[];
}
export interface PointWithTriggerKey extends Point {
    startKey: BasePoint;
}
export interface PointWithMultipleStartKeys extends Point {
    startKeys: BasePoint[];
}
export interface PointWithStatus extends BasePoint {
    status: POINT_RELEVANT_STATUS;
}
export declare type Scope = string | null;
export declare enum POINT_RELEVANT_STATUS {
    SAME_POINT = 1,
    UP_STREAM = 2,
    DOWN_STREAM = 2,
    IRRELEVANT = 4
}
export declare enum NodeStatus {
    Running = "Running",
    Finish = "Finish",
    Waiting = "Watting",
    IDeal = "IDeal",
    Error = "Error"
}
export interface RunningPoint extends BasePoint {
    key: string;
    deps?: string[];
    status?: NodeStatus;
}
