import {
  ReactionContext,
  STATUS_TYPE,
  Point,
  ISnapShotTrigger,
  IStatusInfo,
  TASK_PROCESS_TYPE,
  IRdxView,
  BasePoint,
  PreDefinedTaskQueue,
} from '../global';
import { TaskStatus, ShareContextClass } from './shareContext';
import { Base } from './core';

export type MapObject<T> = { [key: string]: T | null };

export interface RdxContextProps<IModel, IRelyModel> {
  name?: string;
  children: React.ReactNode;
  withRef?: React.MutableRefObject<ShareContextClass<IModel, IRelyModel>>;
  // 全局状态数据，更新数据可能会触发调度更新，会对数据进行shallow Equal，更新必须是新对象
  state?: MapObject<IModel>;
  initializeState?: MapObject<IModel>;
  onStateChange?: (key: string, value: any, type: ActionType) => void;
  onChange?: (state: MapObject<IModel>, stateInstance: any) => void;
  shouldUpdate?: (preValue: IModel, nextValue: IModel) => void;
  createStore?: (data: any) => Base<IModel>;
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
export interface Action<IModel, IRelyModel> {
  type?: ActionType;
  targetType: TargetType;
  payload?:
    | {
        key: string;
        value:
          | IRdxView<IModel, IRelyModel>
          | TaskStatus
          | IModel
          | (() => void)
          | null;
      }
    | { points: BasePoint[]; refresh: boolean; executeTask: boolean }
    | { id: string; customAction: any };
}
export interface BaseLifeCycleProps<IModel, IRelyModel> {
  state: ShareContextClass<IModel, IRelyModel>;
  preState?: ShareContextClass<IModel, IRelyModel>;
}
export interface LifeCycleProps<IModel, IRelyModel>
  extends BaseLifeCycleProps<IModel, IRelyModel> {
  statusType?: STATUS_TYPE;
  unMountRef: React.MutableRefObject<boolean>;
  onChange: (value: MapObject<IModel>) => void;
  queue?: PreDefinedTaskQueue<IModel> | null;
  showLoading?: (context: ReactionContext<IModel, IRelyModel>) => boolean;
  dispatch: React.Dispatch<Action<IModel, IRelyModel>[]>;
  // 默认false
  isFirst?: boolean;
}
/**
 * 定义静态reducer， 否则可能同时存在多个reducer
 * https://stackoverflow.com/questions/54892403/usereducer-action-dispatched-twice
 *
 * @template T
 * @template U
 * @param {ShareContextClass<IModel, IRelyModel>} state
 * @param {Action<IModel, IRelyModel>} action
 * @returns
 */
