import * as React from 'react';

import {
  TaskEventType,
  NodeStatus,
  ShareContextClass,
  IStateInfo,
  useRdxStateContext,
  IStatusInfo,
  IRdxSnapShotTrigger,
} from '@czwcode/rdx';
import { getDefaultSnapShot } from './utils';

export interface ISnapShot extends IRdxSnapShotTrigger {
  // 事件类型
  type: TaskEventType;
  // 当前点的状态
  status: IStatusInfo[];
}

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
export interface IGraph<IModel> {
  context: ShareContextClass;
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
export interface IDataPersistenData {
  realTimeState: any;
  allSnapShots: DataPersistSnapShot[];
  snapShots: DataPersistSnapShot[];
  temporarySnapShots: DataPersistSnapShot;
}
const DataPersistenceHook = (
  shareContext?: React.Context<ShareContextClass>
) => {
  const context = useRdxStateContext(shareContext);
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
    setStateProxy((state) => {
      return {
        snapShots:
          !state.temporarySnapShots !== null
            ? [...state.snapShots, state.temporarySnapShots]
            : state.snapShots,
        temporarySnapShots: getDefaultSnapShot(type),
      };
    });
  }, []);
  const mergeTemporarySnapShots = React.useCallback(() => {
    setStateProxy((state) => ({
      snapShots: [...state.snapShots, state.temporarySnapShots],
      temporarySnapShots: null,
    }));
  }, []);
  const deleteEvent = React.useMemo(() => {
    const startTypes = [
      TaskEventType.Init,
      TaskEventType.UserAction,
    ];
    for (let type of startTypes) {
      context.getSubject().on(type, () => {
        initSnapShot(type);
      });
    }
    const runningTypes = [TaskEventType.Initializing];
    for (let type of runningTypes) {
      context.getSubject().on(type, (process) => {
        setStateProxy((state) => ({
          temporarySnapShots: { ...state.temporarySnapShots, ...process },
        }));
      });
    }
    context.getSubject().on(TaskEventType.Trigger, ({ type, process}) => {
      initSnapShot(type);
      setStateProxy((state) => ({
        temporarySnapShots: { ...state.temporarySnapShots, ...process },
      }));
    });
    const endTypes = [
      TaskEventType.InitEnd,
      TaskEventType.UserActionEnd,
      TaskEventType.TaskExecutingEnd,
    ];
    for (let type of endTypes) {
      context.getSubject().on(type, () => {
        mergeTemporarySnapShots();
      });
    }

    context
      .getSubject()
      .on(TaskEventType.StateChange, (stateInfo: IStateInfo) => {
        setStateProxy((state) => ({
          temporarySnapShots: {
            ...state.temporarySnapShots,
            states: [
              ...(state.temporarySnapShots && state.temporarySnapShots.states
                ? state.temporarySnapShots.states
                : []),
              stateInfo,
            ],
          },
        }));
      });
    // context
    //   .getSubject()
    //   .on(TaskEventType.StatusChange, (process: IStatusInfo) => {
    //     setStateProxy((state) => {
    //       return {
    //         temporarySnapShots: {
    //           ...state.temporarySnapShots,
    //           status: [
    //             ...(state.temporarySnapShots
    //               ? state.temporarySnapShots.status
    //               : []),
    //             process,
    //           ],
    //         },
    //       }
    //     });
    //   });
    return () => {
      const ee = context.getSubject();
      ee.removeAllListeners(TaskEventType.Init);
      ee.removeAllListeners(TaskEventType.RdxContextInit);
    };
  }, []);
  React.useEffect(() => {
    return () => {
      deleteEvent();
    };
  }, []);
  console.log('TaskEventType...', state);
  return {
    ...state,
    realTimeState: context.getAllTaskState(),
    allSnapShots: [...state.snapShots, state.temporarySnapShots].filter(
      Boolean
    ),
  };
};

export default DataPersistenceHook;
