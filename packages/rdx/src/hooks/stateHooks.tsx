import {
  Status,
  IRdxAnyDeps,
  DataContext,
  StateUpdateType,
  TNext,
} from '../global';
import { RdxState } from '../RdxValues/base';
import {
  IRdxAtomState,
  RdxAtomNode,
  IRdxComputeNode,
  RdxComputeNode,
} from '../RdxValues';
import {
  useRef,
  useMemo,
  useEffect,
  useState,
  useContext,
  useCallback,
} from 'react';
import {
  initValue,
  ShareContextClass,
  TaskStatus,
} from '../RdxContext/shareContext';
import { getId, createBaseContext, createMutators } from '../utils/taskUtils';
import { useForceUpdate } from './hookUtils';
import React from 'react';

export function createRdxStateContext() {
  return React.createContext<ShareContextClass>(
    new ShareContextClass(initValue())
  );
}

export interface IStatusMutator {
  mount: (id) => void;
  status: Status;
  errors: string[];
}
export const DefaultContext = createRdxStateContext();
export function useRdxStateContext(
  context: React.Context<ShareContextClass> = DefaultContext
) {
  return useContext(context);
}

export function getStatusKey(id: string, stateUpdateType: StateUpdateType) {
  return id + '----' + stateUpdateType;
}
export function createRdxHooks(provider = DefaultContext) {
  const useContext = () => {
    return useRdxStateContext(provider);
  };
  function useRdxLoading() {
    const context = useContext();
    useGlobalStateUpdate();
    useTriggerTaskScheduleUpdate();
    return () => context.taskScheduler.isRunning();
  }
  function useStateUpdate(id: string) {
    const context = useContext();
    const [state, setState] = useState();
    // const forceUpdate = useForceUpdate();
    useEffect(() => {
      const eventKey = getStatusKey(id, StateUpdateType.State);
      const listener = () => {
        setState(context.getTaskStateById(id));
      };
      context.getEventEmitter().on(eventKey, listener);
      return () => {
        context.getEventEmitter().removeListener(eventKey, listener);
      };
    }, []);
  }

  function useGlobalStateUpdate() {
    const context = useContext();
    const forceUpdate = useForceUpdate();
    useEffect(() => {
      const listener = () => {
        forceUpdate();
      };
      context.getEventEmitter().on(StateUpdateType.GlobalState, listener);
      return () => {
        context
          .getEventEmitter()
          .removeListener(StateUpdateType.GlobalState, listener);
      };
    }, []);
  }

  function useTriggerTaskScheduleUpdate() {
    const context = useContext();
    const forceUpdate = useForceUpdate();
    useEffect(() => {
      const listener = () => {
        forceUpdate();
      };
      context
        .getEventEmitter()
        .on(StateUpdateType.TriggerTaskSchedule, listener);
      return () => {
        context
          .getEventEmitter()
          .removeListener(StateUpdateType.TriggerTaskSchedule, listener);
      };
    }, []);
  }

  function useStatusUpdate(id: string) {
    const context = useContext();
    const [state, setState] = useState<TaskStatus>();
    useEffect(() => {
      const listener = () => {
        setState(context.getTaskStatusById(id));
      };
      const eventKey = getStatusKey(id, StateUpdateType.ReactionStatus);
      context.getEventEmitter().on(eventKey, listener);
      return () => {
        context.getEventEmitter().removeListener(eventKey, listener);
      };
    }, []);
  }

  function useTaskBinding<GModel>(props: RdxState<GModel>) {
    // 1. 初始化的时候根据atom 默认值类型判断是否是异步任务，判断是否要重跑任务
    // 2. 根据get是否是异步任务，判断是否需要重跑任务
    const context = useContext();
    if (!context.getTaskStateById) {
      throw new Error('使用rdx的组件必须为rdxContext子孙组件');
    }
    // 注册节点
    useMemo(() => {
      if (!context.hasTask(props.getId())) {
        props.load(context);
      }
    }, [props.getId()]);
    useEffect(() => {
      return () => {
        console.log("unmount")
      }
    }, [])
    useEffect(() => {
      return () => {
        
        //  卸载节点，检查依赖&warning
        // !合适的时机或者标记来控制删除，否则Unmount的执行比Memo的执行晚， 会在后面把任务移除掉的
        // context.removeTask(getId(props));
      };
    }, [props.getId()]);
  }

  /**
   * 绑定rdxNode到context中, 并绑定状态了状态
   * @param node
   */
  function useRdxNodeBinding<GModel>(
    node: RdxState<GModel> | string,
    stateUpdate: boolean = true
  ): DataContext<GModel> {
    const context = useContext();
    if (node instanceof RdxState) {
      useTaskBinding(node);
    } else if (!context.hasTask(node)) {
      throw new Error(`未找到id为${node}的节点`);
    }
    stateUpdate && useStateUpdate(getId(node));

    const data: DataContext<GModel> = {
      ...createBaseContext(getId(node), context),
      ...createMutators(getId(node), context),
    };
    return data;
  }

  // ?当依赖的组件移除了怎么办，为啥共享组件数据的时候，数据需要提到父级， 因为当组件移除的情况下，父级组件用户可以主动的控制
  function useRdxAtom<GModel>(props: IRdxAtomState<GModel>) {
    const rdxAtom = new RdxAtomNode(props);
    const dataContext = useRdxNodeBinding(rdxAtom);
    return [dataContext.value, dataContext.next, rdxAtom] as [
      GModel,
      (v: GModel) => void,
      RdxAtomNode<GModel>
    ];
  }
  function useRdxAtomLoader<GModel>(
    props: IRdxAtomState<GModel>
  ): [GModel, TNext<GModel>, DataContext<GModel>, RdxAtomNode<GModel>] {
    const rdxAtom = new RdxAtomNode(props);
    const dataContext = useRdxNodeBinding<GModel>(rdxAtom);
    useStatusUpdate(rdxAtom.getId());
    return [dataContext.value, dataContext.next, dataContext, rdxAtom];
  }

  function useRdxRefrence<GModel>(id: string) {
    return useRdxNodeBinding<GModel>(id);
  }
  function useRdxCompute<GModel>(props: IRdxComputeNode<GModel>, deps?: any[]) {
    const newProps = { ...props };
    // 这里通过rdxCompute实现类比ComputeFamily的功能
    if (deps && Array.isArray(deps)) {
      newProps.id = `${newProps.id}__compute/${JSON.stringify(deps)}`;
    }
    const dataContext = useRdxNodeBinding(new RdxComputeNode(newProps));
    return [dataContext.value, dataContext.next] as [GModel, TNext<GModel>];
  }

  function useRdxComputeLoader<GModel>(
    props: IRdxComputeNode<GModel>,
    deps?: string[]
  ): [GModel, TNext<GModel>, DataContext<GModel>] {
    const newProps = { ...props };
    // 这里通过rdxCompute实现类比ComputeFamily的功能
    if (deps && Array.isArray(deps)) {
      newProps.id = `${newProps.id}__compute/${JSON.stringify(deps)}`;
    }
    const compute = new RdxComputeNode(newProps);
    useStatusUpdate(compute.getId());
    const dataContext = useRdxNodeBinding<GModel>(compute);
    return [dataContext.value, dataContext.next, dataContext];
  }
  function useRdxGlobalContext() {
    const context = useContext();
    useGlobalStateUpdate();
    return {
      taskState: context.getAllTaskState(),
      virtualTaskState: context.getAllVirtualTaskState(),
    };
  }
  function useRdxGlboalState() {
    const context = useContext();
    useGlobalStateUpdate();
    return context.getAllTaskState();
  }
  // =======================================基础hooks=========================================================

  function useRdxStatus(): IStatusMutator {
    const forceUpdate = useForceUpdate();
    const context = useRdxStateContext();
    const bindsRef = useRef<Map<string, () => void>>(new Map());
    useEffect(() => {
      return () => {
        Array.from(bindsRef.current.keys()).forEach((id) => {
          const eventKey = getStatusKey(id, StateUpdateType.State);
          context
            .getEventEmitter()
            .removeListener(eventKey, bindsRef.current.get(id));
        });
      };
    }, []);
    // 加载中  异常  finish
    const getStatus = useCallback(() => {
      const ids = Array.from(bindsRef.current.keys());
      const isError = ids.some(
        (key) => context.getTaskStatusById(key).value === Status.Error
      );
      const isLoading = ids.some(
        (key) =>
          context.getTaskStatusById(key).value === Status.Waiting ||
          context.getTaskStatusById(key).value === Status.Running
      );
      const errors = ids
        .map((key) => context.getTaskStatusById(key).errorMsg)
        .filter(Boolean);
      return {
        status: isError
          ? Status.Error
          : isLoading
          ? Status.Running
          : Status.IDeal,
        errors,
      };
    }, []);
    return {
      mount: (id) => {
        const eventKey = getStatusKey(id, StateUpdateType.State);
        if (!bindsRef.current.has(eventKey)) {
          const listener = () => {
            forceUpdate();
          };
          context.getEventEmitter().on(eventKey, listener);
          bindsRef.current.set(id, listener);
        }
      },
      ...getStatus(),
    };
  }
  function useRdxState<GModel>(
    props: RdxState<GModel> | string,
    mutators?: IStatusMutator
  ): [GModel, (v: GModel) => void] {
    const context = useRdxNodeBinding<GModel>(props);
    mutators && mutators.mount(getId(props));
    return [context.value, context.next];
  }

  function useRdxSetter<GModel>(props: RdxState<GModel> | string) {
    const context = useRdxNodeBinding<GModel>(props, false);
    return context.next;
  }
  function useRdxStateLoader<GModel>(
    node: RdxState<GModel> | string
  ): [Status, GModel, (v: GModel) => void] {
    const context = useRdxNodeBinding<GModel>(node);
    useStatusUpdate(getId(node));
    return [context.status, context.value, context.next];
  }

  function useRdxValue<GModel>(
    node: RdxState<GModel> | string,
    mutators?: IStatusMutator
  ): GModel {
    let context = useRdxNodeBinding<GModel>(node);
    mutators && mutators.mount(getId(node));
    return context.value;
  }

  function useRdxValueLoader<GModel>(node: RdxState<GModel>): [Status, any] {
    const context = useRdxNodeBinding(node);
    useStatusUpdate(getId(node));
    return [context.status, context.value];
  }

  // =======================================基础hooks=========================================================

  let reactionPreviewId = 0;
  function useRdxValueByDependencies<IRelyModel>(props: {
    displayName?: string;
    deps: IRdxAnyDeps[];
  }): IRelyModel {
    const { deps = [], displayName } = props;
    const uniqueId = useRef(`${displayName}-preview` + reactionPreviewId++);
    const context = useRdxCompute({
      id: uniqueId.current,
      get: ({ get }) => {
        return deps.map((dep) => get(dep));
      },
    });
    return (context[0] as unknown) as any;
  }
  return {
    useRdxAtom,
    useRdxAtomLoader,
    useRdxCompute,
    useRdxNodeBinding,
    useRdxComputeLoader,
    useRdxGlboalState,
    useRdxGlobalContext,
    useRdxRefrence,
    useRdxState,
    useRdxValue,
    useRdxStateLoader,
    useRdxValueLoader,
    useRdxValueByDependencies,
    useRdxSetter,
    useRdxLoading,
    useRdxStatus,
  };
}

const defaultHooks = createRdxHooks(DefaultContext);
export const useRdxAtom = defaultHooks.useRdxAtom;
export const useRdxAtomLoader = defaultHooks.useRdxAtomLoader;
export const useRdxCompute = defaultHooks.useRdxCompute;
export const useRdxComputeLoader = defaultHooks.useRdxComputeLoader;
export const useRdxGlboalState = defaultHooks.useRdxGlboalState;
export const useRdxRefrence = defaultHooks.useRdxRefrence;
export const useRdxState = defaultHooks.useRdxState;
export const useRdxValue = defaultHooks.useRdxValue;
export const useRdxStateLoader = defaultHooks.useRdxStateLoader;
export const useRdxValueLoader = defaultHooks.useRdxValueLoader;
export const useRdxValueByDependencies = defaultHooks.useRdxValueByDependencies;
export const useRdxSetter = defaultHooks.useRdxSetter;
export const useRdxNodeBinding = defaultHooks.useRdxNodeBinding;
export const useRdxStatus = defaultHooks.useRdxStatus;
