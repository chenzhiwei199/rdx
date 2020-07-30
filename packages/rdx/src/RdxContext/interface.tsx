import {
  TASK_INIT_TYPE,
  ReactionContext,
  STATUS_TYPE,
  Point,
  ISnapShotTrigger,
  IStatusInfo,
  TASK_PROCESS_TYPE,
  IBase,
  BasePoint,
  PreDefinedTaskQueue,
} from '../global';
import { TaskStatus, ShareContextClass } from './shareContext';
import { BaseObject, ScopeObject, Base } from './core';

export type MapObject<T> = { [key: string]: T | null };

export interface RdxContextProps<IModel, IRelyModel, IModuleConfig> {
  name?: string
  children: React.ReactNode;
  withRef?: React.MutableRefObject<ShareContextClass<IModel, IRelyModel, IModuleConfig>>
  // 任务基础数据，更新数据可能会触发调度更新，会对数据进行shallow Equal
  //  外部修改数据的方式，如果数据修改了，必须更新对象，否则将失效
  state?: MapObject<IModel>;
  initializeState?: MapObject<IModel>;
  onStateChange?: (key: string, value: any, type: ActionType) => void;
  onChange?: (state: MapObject<IModel>, stateInstance: any) => void;
  shouldUpdate?: (preValue: IModel, nextValue: IModel) => void
  createStore?: (data: any) => Base<IModel>
  // 依赖数据池
}

export interface INIT_INFO {
  task: Point[];
}
export type ProcessGraphContent = ISnapShotTrigger | IStatusInfo;
export type ProcessType = PROCESS_GRAPH_TYPE | TASK_PROCESS_TYPE;
export interface Process {
  type: ProcessType;
  content: ProcessGraphContent;
}
export enum PROCESS_GRAPH_TYPE {
  INIT = 'INIT',
  TASK_CHANGE = 'TASK_CHANGE',
}

export enum ActionType {
  Update = 'update',
  Remove = 'remove',
  Merge = 'merge',
}
export enum TargetType {
  TasksMap = 'tasksMap',
  TaskState = 'taskState',
  Trigger = 'trigger',
  CustomAction = 'customAction',
  TaskStatus = 'taskStatus',
  CancelMap = 'cancelMap',
}
export interface Action<IModel, IRelyModel, IModuleConfig> {
  type?: ActionType;
  targetType: TargetType;
  payload?:
    | {
        key: string;
        value:
          | IBase<IModel, IRelyModel, IModuleConfig, any>
          | TaskStatus
          | IModel
          | (() => void)
          | null;
      }
    | { points: BasePoint[]; refresh: boolean; executeTask: boolean }
    | { id: string; customAction: any };
}
export interface BaseLifeCycleProps<IModel, IRelyModel, IModuleConfig> {
  state: ShareContextClass<IModel, IRelyModel, IModuleConfig>;
  preState?: ShareContextClass<IModel, IRelyModel, IModuleConfig>;
}
export interface LifeCycleProps<IModel, IRelyModel, IModuleConfig>
  extends BaseLifeCycleProps<IModel, IRelyModel, IModuleConfig> {
  statusType?: STATUS_TYPE;
  unMountRef: React.MutableRefObject<boolean>;
  onChange: (value: MapObject<IModel>) => void;
  queue?: PreDefinedTaskQueue<IModel> | null;
  rerun?: (
    taskKey: string,
    taskStore?: MapObject<IModuleConfig>,
    preTaskStore?: MapObject<IModuleConfig>
  ) => boolean;
  showLoading?: (
    context: ReactionContext<IModel, IRelyModel, IModuleConfig>
  ) => boolean;
  dispatch: React.Dispatch<Action<IModel, IRelyModel, IModuleConfig>[]>;
  // 默认false
  isFirst?: boolean;
}
/**
 * 定义静态reducer， 否则可能同时存在多个reducer
 * https://stackoverflow.com/questions/54892403/usereducer-action-dispatched-twice
 *
 * @template T
 * @template U
 * @param {ShareContextClass<IModel, IRelyModel, IModuleConfig>} state
 * @param {Action<IModel, IRelyModel, IModuleConfig>} action
 * @returns
 */
