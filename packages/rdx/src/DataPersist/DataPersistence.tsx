import * as React from 'react';
import { IStateInfo, NodeStatus } from '../global';
import { useRdxStateContext } from '../hooks/stateHooks';
import { ShareContextClass } from '../RdxContext/shareContext';

import { DataPersistSnapShot, getDefaultSnapShot, TaskEventType } from './type';

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
(window as any).__EASYCANVAS_DEVTOOL__ = true;
const elem = document.createElement('div')
// Listen for the event.

const DataPersistenceHook = (
  shareContext?: React.Context<ShareContextClass>
) => {
  const context = useRdxStateContext(shareContext);
  const temporarySnapShots = React.useRef(null);

  function dispatchData() {
    if (temporarySnapShots.current) {
      // Target can be any Element or other EventTarget.
      console.log("发送消息啦", JSON.parse(JSON.stringify(temporarySnapShots.current)))
      document.dispatchEvent(new CustomEvent('__EASYCANVAS_BRIDGE_TOPANEL__', {
        detail:JSON.parse(JSON.stringify(temporarySnapShots.current)),
      }))
      // console.log('temporarySnapShots.current: ', temporarySnapShots.current, JSON.stringify(event));
    }
  }
  const initSnapShot = React.useCallback((type: TaskEventType) => {
    dispatchData();
    temporarySnapShots.current = getDefaultSnapShot(type);
  }, []);
  const mergeTemporarySnapShots = React.useCallback(() => {
    dispatchData();
    temporarySnapShots.current = null;
  }, []);

  const deleteEvent = React.useMemo(() => {
    context.getSubject().on(TaskEventType.UserAction, () => {
      initSnapShot(TaskEventType.UserAction);
    });


    context.getSubject().on(TaskEventType.DynamicDepsUpdate, ({ type, process}) => {
      initSnapShot(type);
      temporarySnapShots.current = {
        ...temporarySnapShots.current,
        ...process,
      };
    });
    context.getSubject().on(TaskEventType.TaskLoad, ({ type, process}) => {
      initSnapShot(type);
      temporarySnapShots.current = {
        ...temporarySnapShots.current,
        ...process,
      };
    });
    context.getSubject().on(TaskEventType.Trigger, ({ type, process }) => {
      initSnapShot(type);
      temporarySnapShots.current = {
        ...temporarySnapShots.current,
        ...process,
      };
    });
    const endTypes = [TaskEventType.TaskLoadEnd, TaskEventType.TaskExecutingEnd];
    for (let type of endTypes) {
      context.getSubject().on(type, ( process) => {
        temporarySnapShots.current = {
          ...temporarySnapShots.current,
          ...process,
        };
        mergeTemporarySnapShots();
      });
    }
    context
      .getSubject()
      .on(TaskEventType.StateChange, (stateInfo: IStateInfo) => {
        temporarySnapShots.current = {
          ...temporarySnapShots.current,
          states: [
            ...(temporarySnapShots.current && temporarySnapShots.current.states
              ? temporarySnapShots.current.states
              : []),
            stateInfo,
          ],
        };
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
    realTimeState: context.getAllTaskState(),
  };
};

export default DataPersistenceHook;
