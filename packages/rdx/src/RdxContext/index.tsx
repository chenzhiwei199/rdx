import * as React from 'react';
import { initValue, ShareContextClass } from './shareContext';
import { RdxContextProps } from './interface';
import { ShareContextProvider } from './shareContext';
import { ScopeObject } from './core';
import UiBatcher from './UiBatcher';
import ScheduleBatcher from './ScheduleBatcher';
import ReactDOM from 'react-dom';
import { TaskEventType } from '../global';
export * from './core';
const Rdx = <IModel extends Object, IRelyModel, IModuleConfig extends Object>(
  props: RdxContextProps<IModel, IRelyModel>
) => {
  const {
    initializeState,
    onChange = () => {},
    onStateChange = () => {},
    shouldUpdate,
    state,
    name,
    withRef,
    createStore,
  } = props;
  const isUnderControl = state !== undefined;
  const currentState = state || initializeState || {};
  function createTaskState(value: any) {
    return createStore
      ? createStore(currentState)
      : new ScopeObject(currentState);
  }
  const store = React.useRef(
    new ShareContextClass<IModel, IRelyModel>({
      ...initValue(),
      name,
      taskState: createTaskState(currentState),
    })
  );
  store.current.onPropsChange = onChange;
  store.current.onPropsStateChange = onStateChange;
  const uiNotifyBatcherOfChange = React.useRef<any>(null);
  const setUiNotifyBatcherOfChange = (x: any) => {
    uiNotifyBatcherOfChange.current = x;
  };

  const scheduleNotifyBatcherOfChange = React.useRef<any>(null);
  const setScheduleNotifyBatcherOfChange = (x: any) => {
    scheduleNotifyBatcherOfChange.current = x;
  };

  store.current.batchUiChange = () => {
    uiNotifyBatcherOfChange.current();
  };

  store.current.batchTriggerChange = () => {
    scheduleNotifyBatcherOfChange.current();
  };

  withRef && (withRef.current = store.current);
  store.current.subject.emit(TaskEventType.RdxContextInit);
  React.useEffect(() => {
    if (isUnderControl) {
      const diffObjectKeys = Array.from(
        store.current.tasksMap.getAll().keys()
      ).filter((key: any) => {
        return shouldUpdate
          ? shouldUpdate(store.current.taskState.get(key), state[key])
          : state[key] !== store.current.taskState.get(key);
      });
      store.current.taskState = createTaskState(state);
      ReactDOM.unstable_batchedUpdates(() => {
        diffObjectKeys.forEach((key) => {
          store.current.notifyModule(key);
        });
      });
    }
  }, [state]);
  React.useEffect(() => {
    const queue = store.current.queue;
    store.current.parentMounted = true;
    if (queue.size > 0) {
      store.current.batchTriggerSchedule(
        Array.from(queue)
          .reverse()
          .map((item) => ({ key: item, downStreamOnly: false }))
      );
      queue.clear();
    }
  }, []);
  return (
    <ShareContextProvider value={store.current}>
      <UiBatcher setNotifyBatcherOfChange={setUiNotifyBatcherOfChange} />
      <ScheduleBatcher
        setNotifyBatcherOfChange={setScheduleNotifyBatcherOfChange}
      />
      {props.children}
    </ShareContextProvider>
  );
};
export const RdxContext = Rdx;
