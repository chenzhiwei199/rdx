import { NodeStatus } from '@czwcode/graph-core';
import { ISnapShotTrigger } from '@czwcode/task-queue';
import { ShareContextClass, DeliverOptions } from './RdxContext/shareContext';
import { ActionType, TargetType } from './RdxContext/interface';
import { RdxState, RdxNodeType } from './RdxValues';
export * from '@czwcode/task-queue';
export * from '@czwcode/graph-core';

export interface ReactionContext<GModel> extends BaseContext<GModel> {
  /**
   * 当事件冲突时触发时候的回调
   *
   * @memberof ReactionContext
   */
  callbackMapWhenConflict: (callback: () => void) => void;
  /**
   * 更新数据的方法
   */
  updateState: (v: GModel) => void;
  /**
   * 停止任务，并且不执行下游，并且任务不会重复利用
   */
  close: () => void;
}

export type ASYNC_TASK<GModel> = (
  taskInfo: ReactionContext<GModel>
) => Promise<void>;
export type SYNC_TASK<GModel> = (taskInfo: ReactionContext<GModel>) => void;
export type MixedTask<GModel> = ASYNC_TASK<GModel> | SYNC_TASK<GModel>;

export enum STATUS_TYPE {
  BEFORE_TASK_EXECUTE = '1',
  BEFORE_TASK_GROUP_EXECUTE = '2',
}

export enum TASK_INIT_TYPE {
  FROM_PROPS = '1',
  FROM_CHILDREN = '2',
}

export enum RENDER_STATUS {
  FirstRender = 'FIRST_RENDER',
}

export type Status = NodeStatus | RENDER_STATUS;
export const Status = { ...NodeStatus, ...RENDER_STATUS };
export type IRdxAnyDeps = IRdxDeps<any>;
export type IRdxDeps<GModel> = string | RdxState<GModel>;
export type Omit<T, K> = Pick<T, Exclude<keyof T, K>>;
export type Retain<T, K> = Pick<T, Extract<keyof T, K>>;
export type PartialNotOmit<T, K> = Partial<Omit<T, K>>;
export type RequiredNotOmit<T, K> = Required<Omit<T, K>>;
export type PartialExclude<T, K> = Retain<T, K> & PartialNotOmit<T, K>;
// 选中的必选，其他的保留
export type RequiredExclude<T, K> = Omit<T, K> & Required<Retain<T, K>>;

export interface BaseContext<GModel> extends IDataStatus {
  /**
   * 模块唯一id
   */
  id: string;
  /**
   * 当前模块的数据
   */
  value: GModel;
}

export interface IDataStatus {
  /**
   * 当模块的状态为Status.Running 或者 Status.Waiting的时候，loading为true
   */
  loading: boolean;
  /**
   * 当前模块的状态
   */
  status: Status;
  /**
   * 当前模块的错误信息
   */
  errorMsg?: string;
}
export interface DataContext<GModel>
  extends BaseContext<GModel>,
    IMutators<GModel> {}
export type TNext<GModel> = (
  value: GModel | ((oldValue: GModel) => GModel),
  options?: DeliverOptions
) => void;
export interface IMutators<GModel> {
  /**
   * 更新当前模块的数据，并调用当前模块以及下游模块的响应函数
   */
  refresh: (value?: GModel) => void;
  /**
   * 更新当前模块的数据，并调用下游模块的响应函数
   */
  next: TNext<GModel>;
  /**
   * 更新当前模块的数据，并调用下游模块的响应函数
   */
  nextById: (id: string, value: GModel, options?: DeliverOptions) => void;
}

export interface IViewRender<GModel> {
  /**
   * 视图渲染，如果render 和component同时传，则render优先
   *
   * @memberof IBase
   */
  render?: (context: DataContext<GModel>) => React.ReactNode;
  /**
   * 视图渲染的组件
   *
   * @memberof IBase
   */
  component?: React.ComponentType<DataContext<GModel>>;
}

export interface IRdxTaskBase<GModel> extends IRdxReactionProps<GModel> {
  /**
   * 模块依赖的id列表
   *
   * @type {string[]}
   * @memberof IBase
   */
  deps?: IRdxAnyDeps[];
  /**
   * 默认的Model
   *
   * @type {GModel}
   * @memberof IBase
   */
  defaultValue?: GModel;
}
export interface IRdxTask<GModel>
  extends IRdxTaskBase<GModel>,
    IViewRender<GModel> {
  /**
   * 模块的唯一id
   *
   * @type {string}
   * @memberof IBase
   */
  id: string;
  type: RdxNodeType;
  reset: (context: ShareContextClass) => void;
  getValue?: (id: string) => GModel;
  setValue?: (id: string, value: GModel) => void;
}

export interface IRdxState<GModel> {
  id: string;
  defaultValue: GModel;
}
export interface IRdxReactionProps<GModel> {
  /**
   * 依赖数据更新时的回调
   *
   * @memberof IRdxReactionProps
   */
  fireWhenDepsUpdate?: (depsId: string) => void;
  /**
   * 响应式函数
   *
   * @memberof IBase
   */
  reaction?: MixedTask<GModel>;
  /**
   * 数据改变的处理函数
   *
   * @memberof IRdxReactionProps
   */
  next?: (
    context: ShareContextClass,
    id: string,
    value: GModel,
    options?: DeliverOptions
  ) => void;
}

export enum StateUpdateType {
  ReactionStatus = 'ReactionStatus',
  GlobalState = 'GlobalState',
  State = 'State',
  TriggerTaskSchedule = 'TriggerTaskSchedule',
}
export interface IStateInfo {
  actionType: ActionType;
  targetType: TargetType;
  value: any;
  key: string;
}

export interface IRdxSnapShotTrigger extends ISnapShotTrigger {
  // 当前的所有task信息
  tasks?: IRdxTask<any>[];
}
// 当前节点的state
// states: IStateInfo[];
