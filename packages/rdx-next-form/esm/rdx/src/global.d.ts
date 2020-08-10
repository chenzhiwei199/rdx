/// <reference types="react" />
import { ReactionType, IDeps } from '@czwcode/task-queue';
import { NodeStatus } from '@czwcode/graph-core';
import { ShareContextClass, DeliverOptions } from './RdxContext/shareContext';
import { CompareType } from './utils';
import { ActionType, TargetType } from './RdxContext/interface';
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
   * 依赖的模块的值
   */
  depsValues: IRelyModel;
  /**
   * 更新数据的方法
   */
  updateState: (v: IModel) => void;
  /**
   * 模块的其他配置
   */
  moduleConfig?: IModuleConfig;
  /**
   * 依赖的模块配置
   */
  depsModuleConfig?: IModuleConfig[];
}
export declare type ASYNC_TASK<IModel, IRelyModel> = (
  taskInfo: ReactionContext<IModel, IRelyModel>
) => Promise<void>;
export declare type SYNC_TASK<IModel, IRelyModel> = (
  taskInfo: ReactionContext<IModel, IRelyModel>
) => void;
export declare type MixedTask<IModel, IRelyModel> =
  | ASYNC_TASK<IModel, IRelyModel>
  | SYNC_TASK<IModel, IRelyModel>;
export declare enum STATUS_TYPE {
  BEFORE_TASK_EXECUTE = '1',
  BEFORE_TASK_GROUP_EXECUTE = '2',
}
export declare enum TASK_INIT_TYPE {
  FROM_PROPS = '1',
  FROM_CHILDREN = '2',
}
export declare enum RENDER_STATUS {
  FirstRender = 'FIRST_RENDER',
}
export declare type Status = NodeStatus | RENDER_STATUS;
export declare const Status: {
  FirstRender: RENDER_STATUS.FirstRender;
  Running: NodeStatus.Running;
  Finish: NodeStatus.Finish;
  Waiting: NodeStatus.Waiting;
  IDeal: NodeStatus.IDeal;
  Error: NodeStatus.Error;
};
export declare type Omit<T, K> = Pick<T, Exclude<keyof T, K>>;
export declare type Retain<T, K> = Pick<T, Extract<keyof T, K>>;
export declare type PartialNotOmit<T, K> = Partial<Omit<T, K>>;
export declare type RequiredNotOmit<T, K> = Required<Omit<T, K>>;
export declare type PartialExclude<T, K> = Retain<T, K> & PartialNotOmit<T, K>;
export declare type RequiredExclude<T, K> = Omit<T, K> & Required<Retain<T, K>>;
export interface BaseContext<IModel, IRelyModel> {
  /**
   * 模块唯一id
   */
  id: string;
  /**
   * 模块配置
   */
  moduleConfig?: IModuleConfig;
  /**
   * 依赖的模块配置
   */
  depsModuleConfig?: IModuleConfig[];
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
  deps?: IDeps[];
  /**
   * 当前模块依赖的模块数据
   */
  depsValues: IRelyModel;
}
export interface DataContext<IModel, IRelyModel>
  extends BaseContext<IModel, IRelyModel> {
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
  /**
   * 刷新视图
   */
  refreshView: () => void;
  /**
   * 更新当前模块的数据，并调用当前模块以及下游模块的响应函数
   */
  refresh: (value?: IModel) => void;
  /**
   * 如果当前模块配置有scope，可以合并当前scope的数据到全局
   */
  mergeScopeState2Global: () => void;
  /**
   * 派发action后通过reducer进行状态更新
   */
  dispatch: (action: any, options?: DeliverOptions) => void;
  /**
   * 派发action后，触发其他模块的reducer进行状态更新
   */
  dispatchById: (id: string, action: any, options?: DeliverOptions) => void;
  /**
   * 更新当前模块的数据，并调用下游模块的响应函数
   */
  next: (value: IModel, options?: DeliverOptions) => void;
  /**
   * 更新当前模块的数据，并调用下游模块的响应函数
   */
  nextById: (id: string, value: IModel, options?: DeliverOptions) => void;
}
export interface IBase<IModel, IRelyModel, IAction>
  extends IRdxReactionProps<IModel, IRelyModel> {
  /**
   * 模块的唯一id
   *
   * @type {string}
   * @memberof IBase
   */
  id: string;
  /**
   * 当前模块的作用域
   *
   * @type {string}
   * @memberof IBase
   */
  scope?: string;
  /**
   * 校验ModuleConfig是否发生变化，发生变化会重新进行任务调度
   *
   * @memberof IBase
   */
  areEqualForTask?: (
    compareType: CompareType,
    preConfig: IModuleConfig,
    nextConfig: IModuleConfig
  ) => boolean;
  /**
   * 模块配置信息
   *
   * @type {IModuleConfig}
   * @memberof IBase
   */
  moduleConfig?: IModuleConfig;
  /**
   * 默认的Model
   *
   * @type {IModel}
   * @memberof IBase
   */
  defaultValue?: IModel;
  /**
   * 视图渲染
   *
   * @memberof IBase
   */
  render?: (context: DataContext<IModel, IRelyModel>) => React.ReactNode;
  component?: React.ComponentType<DataContext<IModel, IRelyModel>>;
  /**
   *通用交互规则
   *
   * @memberof IBase
   */
  reducer?: (
    state: IModel,
    action: IAction,
    context: ShareContextClass<IModel, any, any>
  ) => IModel;
}
export interface IRdxState<IModel, IAction> {
  id: string;
  defaultValue: IModel;
  /**
   *通用交互规则
   *
   * @memberof IBase
   */
  reducer?: (
    state: IModel,
    action: IAction,
    context: ShareContextClass<IModel, any, any>
  ) => IModel;
}
export interface IRdxReactionProps<IModel, IRelyModel> {
  /**
   * 模块依赖的id列表
   *
   * @type {string[]}
   * @memberof IBase
   */
  deps?: IDeps[];
  recordStatus?:
    | ((context: ReactionContext<IModel, IRelyModel>) => boolean)
    | boolean;
  reactionType?: ReactionType;
  /**
   * 响应式函数
   *
   * @memberof IBase
   */
  reaction?: MixedTask<IModel, IRelyModel>;
}
export declare enum StateUpdateType {
  ReactionStatus = 'ReactionStatus',
  State = 'State',
}
export interface IStateInfo {
  actionType: ActionType;
  targetType: TargetType;
  value: any;
  key: string;
}
