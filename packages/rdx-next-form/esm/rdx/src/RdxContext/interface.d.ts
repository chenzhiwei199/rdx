/// <reference types="react" />
import {
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
import { Base } from './core';
export declare type MapObject<T> = {
  [key: string]: T | null;
};
export interface RdxContextProps<IModel, IRelyModel> {
  name?: string;
  children: React.ReactNode;
  withRef?: React.MutableRefObject<ShareContextClass<IModel, IRelyModel>>;
  state?: MapObject<IModel>;
  initializeState?: MapObject<IModel>;
  onStateChange?: (key: string, value: any, type: ActionType) => void;
  onChange?: (state: MapObject<IModel>, stateInstance: any) => void;
  shouldUpdate?: (preValue: IModel, nextValue: IModel) => void;
  createStore?: (data: any) => Base<IModel>;
}
export interface INIT_INFO {
  task: Point[];
}
export declare type ProcessGraphContent = ISnapShotTrigger | IStatusInfo;
export declare type ProcessType = PROCESS_GRAPH_TYPE | TASK_PROCESS_TYPE;
export interface Process {
  type: ProcessType;
  content: ProcessGraphContent;
}
export declare enum PROCESS_GRAPH_TYPE {
  INIT = 'INIT',
  TASK_CHANGE = 'TASK_CHANGE',
}
export declare enum ActionType {
  Update = 'update',
  Remove = 'remove',
  Merge = 'merge',
}
export declare enum TargetType {
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
          | IBase<IModel, IRelyModel, IModuleConfig, any>
          | TaskStatus
          | IModel
          | (() => void)
          | null;
      }
    | {
        points: BasePoint[];
        refresh: boolean;
        executeTask: boolean;
      }
    | {
        id: string;
        customAction: any;
      };
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
  rerun?: (
    taskKey: string,
    taskStore?: MapObject<IModuleConfig>,
    preTaskStore?: MapObject<IModuleConfig>
  ) => boolean;
  showLoading?: (context: ReactionContext<IModel, IRelyModel>) => boolean;
  dispatch: React.Dispatch<Action<IModel, IRelyModel>[]>;
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
