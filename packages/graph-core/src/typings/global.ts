export interface BasePoint {
  // 当前key
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
  // 当前key关联的起点
  startKey: BasePoint;
}

export interface PointWithMultipleStartKeys extends Point {
  // 当前key关联的起点
  startKeys: BasePoint[];
}

export interface PointWithStatus extends BasePoint {
  status: POINT_RELEVANT_STATUS;
}

export type Scope = string | null;

export enum POINT_RELEVANT_STATUS {
  SAME_POINT = 1,
  UP_STREAM = 2,
  DOWN_STREAM = 2,
  IRRELEVANT = 4,
}

export enum NodeStatus {
  Running = 'RUNNING',
  Finish = 'FINISH',
  Waiting = 'WATTING',
  IDeal = 'NONE',
  Error = 'ERROR',
}
export interface RunningPoint extends BasePoint {
  key: string;
  deps?: string[];
  status?: NodeStatus;
}
