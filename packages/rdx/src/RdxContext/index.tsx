import * as React from 'react';
import { initValue, ShareContextClass } from './shareContext';
import { RdxContextProps } from './interface';
import { ScopeObject } from './core';
import { StateUpdateType } from '../global';
import { DefaultContext } from '../hooks/stateHooks';
import { DataPersistenceHook, TaskEventTriggerType } from '../DataPersist';
export * from './core';
export * from './interface';
const Rdx = (props: RdxContextProps) => {
  const {
    initializeState = {},
    onChange = () => {},
    onLoading = () => {},
    name,
    // withRef,
    context = DefaultContext ,
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
  store.current.setLoadingCallback(() => {
    onLoading()
  })

  // withRef && (withRef.current = store.current);
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
    if (copyState !== store.current.getAllTaskState() && !store.current.taskScheduler.isRunning()) {
      onChange(store.current.getAllTaskState());
    }
  }, []);
  return (
    <context.Provider value={store.current}>
      <DevTool shareContext={context}/>
      {visualStatePlugins}
      {props.children}
    </context.Provider>
  );
};

const DevTool = (props: { shareContext?: React.Context<ShareContextClass>}) => {

  DataPersistenceHook(props.shareContext)
  return <></>
}
export const RdxContext = Rdx;
