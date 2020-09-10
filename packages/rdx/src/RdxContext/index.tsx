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
  // 受控标记
  const isUnderControl = state !== undefined;
  const currentState = state || initializeState || {};
  // 创建store
  function createTaskState(value: any) {
    return createStore
      ? createStore(currentState)
      : new ScopeObject(currentState);
  }

  // context下保留不变的store
  const store = React.useRef(
    new ShareContextClass<IModel, IRelyModel>({
      ...initValue(),
      name,
      taskState: createTaskState(currentState),
    })
  );

  // 绑定批量更新方法
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
  // 生命周期 context Init
  store.current.subject.emit(TaskEventType.RdxContextInit);

  // 序列化状态更新
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
  // const atomTaskRef = React.useRef(new Map());
  // React.useMemo(() => {
  //   getAllNodes().forEach((atom) => {
  //     store.current.addOrUpdateTask(
  //       atom.getId(),
  //       atom.createNodeInfo(
  //         store.current,
  //         (v) => {
  //           atomTaskRef.current.set(atom.getId(), v);
  //         },
  //         () => {
  //           return atomTaskRef.current.get(atom.getId());
  //         }
  //       ),
  //       atom.isNotifyTask(() => {
  //         return atomTaskRef.current.get(atom.getId());
  //       })
  //     );
  //   });
  // }, []);
  // 初始化组件绑定
  // React.useEffect(() => {
  //   const queue = store.current.queue;
  //   store.current.parentMounted = true;
  //   // 获取所有的atoms

  //   if (queue.size > 0) {
  //     const p = [...Array.from(queue)]
  //       // .reverse()
  //       .map((item) => ({ key: item, downStreamOnly: false }));
  //     logger.info('init', p);
  //     store.current.batchTriggerSchedule(p);
  //     queue.clear();
  //   }
  // }, []);
  React.useEffect(() => {
    store.current.parentMounted = true;
  }, []);
  return (
    <ShareContextProvider value={store.current}>
      {props.children}
      <UiBatcher setNotifyBatcherOfChange={setUiNotifyBatcherOfChange} />
      <ScheduleBatcher
        setNotifyBatcherOfChange={setScheduleNotifyBatcherOfChange}
      />
    </ShareContextProvider>
  );
};

export const RdxContext = Rdx;
