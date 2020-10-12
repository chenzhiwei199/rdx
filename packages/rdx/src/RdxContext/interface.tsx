import {
  Point,
  ISnapShotTrigger,
  IStatusInfo,
  TASK_PROCESS_TYPE,
  BasePoint,
} from '@czwcode/task-queue';
import { TaskStatus, ShareContextClass } from './shareContext';
import { Base } from './core';
import { IRdxTask } from '../global';

export type MapObject<T> = { [key: string]: T | null };

export interface RdxContextProps<GModel> {
  name?: string;
  children: React.ReactNode;
  context?: React.Context<ShareContextClass>;
  withRef?: React.MutableRefObject<ShareContextClass>;
  initializeState?: MapObject<GModel>;
  onChange?: (state: MapObject<GModel>) => void;
  createStore?: (data: any) => Base<GModel>;
  visualStatePlugins?: React.ReactNode | React.ReactNode[];
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
  TasksMap = 'tasks',
  TaskState = 'taskState',
  Trigger = 'trigger',
  CustomAction = 'customAction',
  TaskStatus = 'taskStatus',
  CancelMap = 'cancelMap',
}
export interface Action<GModel> {
  type?: ActionType;
  targetType: TargetType;
  payload?:
    | {
        key: string;
        value: IRdxTask<GModel> | TaskStatus | GModel | (() => void) | null;
      }
    | { points: BasePoint[]; refresh: boolean; executeTask: boolean }
    | { id: string; customAction: any };
}
