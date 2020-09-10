import { NodeStatus, BasePoint } from '@czwcode/graph-core';
import {
  ShareContextClass,
  DeliverOptions,
  ShareContext,
} from './RdxContext/shareContext';
import { ActionType, TargetType } from './RdxContext/interface';
import { RdxNode } from './RdxValues';
export * from '@czwcode/task-queue';
export * from '@czwcode/graph-core';

export interface ReactionContext<IModel, IRelyModel>
  extends BaseContext<IModel, IRelyModel> {
  /**
   * 当事件冲突时触发时候的回调
   *
   * @memberof ReactionContext
   */
  callbackMapWhenConflict: (callback: () => void) => void;
  /**
   * 更新数据的方法
   */
  updateState: (v: IModel) => void;
}

export type ASYNC_TASK<IModel, IRelyModel> = (
  taskInfo: ReactionContext<IModel, IRelyModel>
) => Promise<void>;
export type SYNC_TASK<IModel, IRelyModel> = (
  taskInfo: ReactionContext<IModel, IRelyModel>
) => void;
export type MixedTask<IModel, IRelyModel> =
  | ASYNC_TASK<IModel, IRelyModel>
  | SYNC_TASK<IModel, IRelyModel>;

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
export type IRdxDeps<IModel> = string | RdxNode<IModel>;
export type Omit<T, K> = Pick<T, Exclude<keyof T, K>>;
export type Retain<T, K> = Pick<T, Extract<keyof T, K>>;
export type PartialNotOmit<T, K> = Partial<Omit<T, K>>;
export type RequiredNotOmit<T, K> = Required<Omit<T, K>>;
export type PartialExclude<T, K> = Retain<T, K> & PartialNotOmit<T, K>;
// 选中的必选，其他的保留
export type RequiredExclude<T, K> = Omit<T, K> & Required<Retain<T, K>>;

export interface BaseContext<IModel, IRelyModel> extends IDataStatus {
  /**
   * 模块唯一id
   */
  id: string;
  /**
   * 全局状态
   */
  state: any;
  /**
   * 当前模块的数据
   */
  value: IModel;
  /**
   * 依赖的模块上次的值
   */
  lastDepsValue: IRelyModel;
  /**
   * 当前模块依赖的模块id
   */
  deps?: IRdxAnyDeps[];
  /**
   * 当前模块依赖的模块数据
   */
  depsValues: IRelyModel;
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
export interface DataContext<IModel, IRelyModel>
  extends BaseContext<IModel, IRelyModel>,
    IMutators<IModel> {}

export interface IMutators<IModel> {
  /**
   * 刷新视图
   */
  refreshView: () => void;
  /**
   * 更新当前模块的数据，并调用当前模块以及下游模块的响应函数
   */
  refresh: (value?: IModel) => void;
  /**
   * 更新当前模块的数据，并调用下游模块的响应函数
   */
  next: (
    value: IModel | ((oldValue: IModel) => IModel),
    options?: DeliverOptions
  ) => void;
  /**
   * 更新当前模块的数据，并调用下游模块的响应函数
   */
  nextById: (id: string, value: IModel, options?: DeliverOptions) => void;
}

export interface IViewRender<IModel, IRelyModel> {
  /**
   * 视图渲染，如果render 和component同时传，则render优先
   *
   * @memberof IBase
   */
  render?: (context: DataContext<IModel, IRelyModel>) => React.ReactNode;
  /**
   * 视图渲染的组件
   *
   * @memberof IBase
   */
  component?: React.ComponentType<DataContext<IModel, IRelyModel>>;
}

export interface IRdxViewBase<IModel, IRelyModel>
  extends IRdxReactionProps<IModel, IRelyModel> {
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
   * @type {IModel}
   * @memberof IBase
   */
  defaultValue?: IModel;
}
export interface IRdxView<IModel, IRelyModel>
  extends IRdxViewBase<IModel, IRelyModel>,
    IViewRender<IModel, IRelyModel> {
  /**
   * 模块的唯一id
   *
   * @type {string}
   * @memberof IBase
   */
  id: string;
  rerunWhenDepsChange?: boolean;
}

export interface IRdxState<IModel> {
  id: string;
  defaultValue: IModel;
}
export interface IRdxReactionProps<IModel, IRelyModel> {
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
  reaction?: MixedTask<IModel, IRelyModel>;
  /**
   * 数据改变的处理函数
   *
   * @memberof IRdxReactionProps
   */
  next?: (
    context: ShareContextClass<IModel, IRelyModel>,
    id: string,
    value: IModel,
    options?: DeliverOptions
  ) => void;
}

export enum StateUpdateType {
  ReactionStatus = 'ReactionStatus',
  State = 'State',
}
export interface IStateInfo {
  actionType: ActionType;
  targetType: TargetType;
  value: any;
  key: string;
}
// 当前节点的state
// states: IStateInfo[];
