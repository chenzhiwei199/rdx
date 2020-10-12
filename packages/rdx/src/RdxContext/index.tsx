import * as React from 'react';
import { initValue, ShareContextClass } from './shareContext';
import { TaskEventTriggerType, TaskEventType } from '@czwcode/task-queue';
import { RdxContextProps } from './interface';
import { ScopeObject } from './core';
import UiBatcher from './UiBatcher';
import { StateUpdateType } from '../global';
import { DefaultContext } from '..';
export * from './core';
const Rdx = (props: RdxContextProps<any>) => {
  const {
    initializeState = {},
    onChange = () => {},
    name,
    withRef,
    context = DefaultContext,
    createStore,
    visualStatePlugins,
  } = props;
  // 如果initializeState为undefined, 则需要替换状态， 否则不需要
  // 创建store
  function createTaskState(value: any) {
    return createStore
      ? createStore(initializeState)
      : new ScopeObject(initializeState);
  }

  // context下保留不变的store
  const store = React.useRef(
    new ShareContextClass({
      ...initValue(),
      name,
      virtualTaskState: createTaskState(initializeState),
      taskState: createTaskState(initializeState),
    })
  );

  // 绑定批量更新方法
  store.current.setChangeCallback((v) => {
    store.current.getEventEmitter().emit(StateUpdateType.GlobalState);
    onChange(v);
  });
  const uiNotifyBatcherOfChange = React.useRef<any>(null);
  const setUiNotifyBatcherOfChange = (x: any) => {
    uiNotifyBatcherOfChange.current = x;
  };

  store.current.batchUiChange = () => {
    uiNotifyBatcherOfChange.current && uiNotifyBatcherOfChange.current();
  };

  withRef && (withRef.current = store.current);
  let copyState = store.current.getAllTaskState();
  React.useEffect(() => {
    store.current.parentMounted = true;
    // 执行初始化任务
    store.current.executeTask(
      Array.from(store.current.getNotifyQueue()),
      TaskEventTriggerType.BatchReactionOnMount
    );
    store.current.getNotifyQueue().clear();

    // 初始化状态和后续状态不一样，则触发onChange
    if (copyState !== store.current.getAllTaskState()) {
      onChange(store.current.getAllTaskState());
    }
  }, []);
  return (
    <context.Provider value={store.current}>
      {visualStatePlugins}
      <FirstCycleCompnent store={store.current} />
      {props.children}
      <UiBatcher
        context={context}
        setNotifyBatcherOfChange={setUiNotifyBatcherOfChange}
      />
      {/* <ScheduleBatcher
        context={context}
        setNotifyBatcherOfChange={setScheduleNotifyBatcherOfChange}
      /> */}
    </context.Provider>
  );
};
const FirstCycleCompnent = (props: { store: ShareContextClass }) => {
  React.useMemo(() => {
    props.store.emitBase(TaskEventType.Init);
  }, []);
  React.useEffect(() => {
    props.store.emitBase(TaskEventType.Initializing);
  }, []);
  return <></>;
};

export const RdxContext = Rdx;
