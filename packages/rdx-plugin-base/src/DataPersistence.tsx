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
import { DataPersistSnapShot, getDefaultSnapShot } from './utils';



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
  const defaultData = {
    snapShots: [],
    temporarySnapShots: null,
  };
  const context = useRdxStateContext(shareContext);
  const [state, setState] = React.useState<{
    snapShots: DataPersistSnapShot[];
    temporarySnapShots: DataPersistSnapShot;
  }>(defaultData);

  // React.useEffect(() => {
  //   (window as any).__EASYCANVAS_DEVTOOL__ = true;
  //   document.dispatchEvent(
  //     new CustomEvent('__EASYCANVAS_BRIDGE_TOPANEL__', {
  //       detail: '发送消息啦',
  //     })
  //   );
  // }, [state]);
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
    context.getSubject().on(TaskEventType.UserAction, () => {
      initSnapShot(TaskEventType.UserAction);
    });

    context.getSubject().on(TaskEventType.TaskLoad, (type) => {
      initSnapShot(type);
    });
    context.getSubject().on(TaskEventType.Trigger, ({ type, process }) => {
      initSnapShot(type);
      setStateProxy((state) => ({
        temporarySnapShots: { ...state.temporarySnapShots, ...process },
      }));
    });
    const endTypes = [
      // TaskEventType.InitEnd,
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
    return () => {
      const ee = context.getSubject();
      ee.removeAllListeners(TaskEventType.TaskLoad);
    };
  }, []);
  React.useEffect(() => {
    return () => {
      deleteEvent();
    };
  }, []);
  return {
    clear: () => {
      setState(defaultData);
    },
    ...state,
    realTimeState: context.getAllTaskState(),
    allSnapShots: [...state.snapShots, state.temporarySnapShots].filter(
      Boolean
    ),
  };
};

export default DataPersistenceHook;
