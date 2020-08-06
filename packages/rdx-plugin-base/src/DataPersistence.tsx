import * as React from 'react';

import {
  ISnapShot,
  TaskEventType,
  ISnapShotTrigger,
  IStatusInfo,
  NodeStatus,
  ShareContextClass,
  ShareContextInstance,
  IStateInfo,
} from '@czwcode/rdx';
import { getDefaultSnapShot } from './utils';

export enum DISPLAY_STATE {
  CANCEL = 'CANCEL',
  CONFLICT = 'CONFLICT',
}

export const stateColors = {
  [NodeStatus.Error]: 'red',
  [NodeStatus.Waiting]: 'rgb(230,189,45)',
  [NodeStatus.Finish]: 'grey',
  [NodeStatus.IDeal]: 'grey',
  [DISPLAY_STATE.CANCEL]: 'pink',
  [DISPLAY_STATE.CONFLICT]: 'purple',
  init: 'rgb(165, 189,249)',
};
export const stateLabel = {
  init: '初始化',
  [NodeStatus.Error]: '错误',
  [NodeStatus.Waiting]: '运行',
  [NodeStatus.Finish]: '运行结束',
  [DISPLAY_STATE.CANCEL]: '取消',
  [DISPLAY_STATE.CONFLICT]: '冲突',
};
export interface IGraph<IModel, IRelyModel, IModuleConfig> {
  context: ShareContextClass<IModel, IRelyModel, IModuleConfig>;
}

export enum GraphType {
  Global = 'Global',
  PreRunning = 'PreRunning',
  Trigger = 'Trigger',
  EffectPoints = 'EffectPoints',
  ConflictPoints = 'ConflictPoints',
  AllPointsNow = 'AllPointsNow',
  RunnningPointsNotCut = 'RunnningPointsNotCut',
  BuildDAG = 'BuildDAG',
  RunnningPointsCut = 'RunnningPointsCut',
}
export interface IGraphState {
  version: number;
  visible: boolean;
  statusVersion: number;
}
export interface DataPersistSnapShot extends ISnapShot {
  states: IStateInfo[];
}
interface DataPersistenceHookState {
  snapShots: DataPersistSnapShot[];
  temporarySnapShots: DataPersistSnapShot;
}
const DataPersistenceHook = () => {
  const context = React.useContext<ShareContextClass<any, any, any>>(ShareContextInstance);
  const [state, setState] = React.useState<{
    snapShots: DataPersistSnapShot[];
    temporarySnapShots: DataPersistSnapShot;
  }>({
    snapShots: [],
    temporarySnapShots: null,
  });
  const setStateProxy = (
    callback: (state) => Partial<DataPersistenceHookState>
  ) => {
    setState((state) => ({
      ...state,
      ...callback(state),
    }));
  };
  const initSnapShot = React.useCallback((type: TaskEventType) => {
    setStateProxy((state) => ({
      snapShots: [...state.snapShots, state.temporarySnapShots],
      temporarySnapShots: getDefaultSnapShot(type),
    }));
  }, []);
  React.useEffect(() => {
    context.subject.on(TaskEventType.Init, (process) => {
      initSnapShot(TaskEventType.Init);
    });
    context.subject.on(TaskEventType.RdxContextInit, (process) => {
      initSnapShot(TaskEventType.RdxContextInit);
    });
    context.subject.on(TaskEventType.EventTrigger, (process) => {
      initSnapShot(TaskEventType.EventTrigger);
    });
    context.subject.on(TaskEventType.BatchEventTrigger, (process) => {
      initSnapShot(TaskEventType.BatchEventTrigger);
    });
    context.subject.on(TaskEventType.TaskChange, (process) => {
      initSnapShot(TaskEventType.TaskChange);
    });
    context.subject.on(
      TaskEventType.ProcessRunningGraph,
      (process: ISnapShotTrigger) => {
        setStateProxy((state) => ({
          temporarySnapShots: { ...state.temporarySnapShots, ...process },
        }));
      }
    );

    context.subject.on(TaskEventType.StateChange, (stateInfo: IStateInfo) => {
      setStateProxy((state) => ({
        temporarySnapShots: {
          ...state.temporarySnapShots,
          states: [
            ...(state.temporarySnapShots
              ? state.temporarySnapShots.states
              : []),
            stateInfo,
          ],
        },
      }));
    });
    context.subject.on(TaskEventType.StatusChange, (process: IStatusInfo) => {
      setStateProxy((state) => ({
        temporarySnapShots: {
          ...state.temporarySnapShots,
          status: [...state.temporarySnapShots.status, process],
        },
      }));
    });
    return () => {
      const ee = context.subject;
      ee.removeAllListeners(TaskEventType.Init);
      ee.removeAllListeners(TaskEventType.RdxContextInit);
      ee.removeAllListeners(TaskEventType.EventTrigger);
      ee.removeAllListeners(TaskEventType.ProcessRunningGraph);
      ee.removeAllListeners(TaskEventType.StatusChange);
      ee.removeAllListeners(TaskEventType.TaskChange);
    };
  }, []);
  return {
    ...state,
    realTimeState: context.taskState.getAll(),
    allSnapShots: [...state.snapShots, state.temporarySnapShots].filter(
      Boolean
    ),
  };
};

export default DataPersistenceHook;
