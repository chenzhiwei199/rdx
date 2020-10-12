import {
  Status,
  IRdxAnyDeps,
  DataContext,
  IRdxTask,
  StateUpdateType,
} from '../global';
import { RdxNode } from '../RdxValues/base';
import {
  IRdxAtomNode,
  RdxAtomNode,
  IRdxWatcherNode,
  RdxWatcherNode,
} from '../RdxValues';
import { useRef, useMemo, useEffect } from 'react';
import { useRdxStateContext, DefaultContext } from '../RdxContext/shareContext';
import { useForceUpdate, useGlobalStateUpdate } from './hookUtils';
import {
  getDepId,
  createBaseContext,
  createMutators,
} from '../utils/taskUtils';
import { ShareContextClass, TNext } from '..';

export function createRdxHooks(provider = DefaultContext) {
  function getId<GModel>(props: IRdxTask<GModel> | RdxNode<GModel>) {
    if (props instanceof RdxNode) {
      return props.getId();
    } else {
      return props.id;
    }
  }

  function useStateUpdate(id: string, type: StateUpdateType) {
    const context = useRdxStateContext(provider);
    const forceUpdate = useForceUpdate();
    useEffect(() => {
      const eventKey = id + '----' + type;
      context.getEventEmitter().on(eventKey, () => {
        forceUpdate();
      });
      return () => {
        context.getEventEmitter().off(eventKey);
      };
    }, []);
  }

  function useTaskBinding<GModel>(props: RdxNode<GModel>) {
    // 1. 初始化的时候根据atom 默认值类型判断是否是异步任务，判断是否要重跑任务
    // 2. 根据get是否是异步任务，判断是否需要重跑任务
    const context = useRdxStateContext(provider);
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
    node: RdxNode<GModel> | string
  ): DataContext<GModel> {
    const context = useRdxStateContext(provider);
    if (node instanceof RdxNode) {
      useTaskBinding(node);
    } else if (!context.hasTask(node)) {
      throw new Error(`未找到id为${node}的节点`);
    }
    useStateUpdate(getDepId(node), StateUpdateType.State);

    const data: DataContext<GModel> = {
      ...createBaseContext(getDepId(node), context),
      ...createMutators(getDepId(node), context),
    };
    return data;
  }

  // ?当依赖的组件移除了怎么办，为啥共享组件数据的时候，数据需要提到父级， 因为当组件移除的情况下，父级组件用户可以主动的控制
  function useRdxAtom<GModel>(props: IRdxAtomNode<GModel>) {
    const rdxAtom = new RdxAtomNode(props);
    const dataContext = useRdxNodeBinding(rdxAtom);
    return [dataContext.value, dataContext.next, rdxAtom] as [
      GModel,
      (v: GModel) => void,
      RdxAtomNode<GModel>
    ];
  }
  function useRdxAtomLoader<GModel>(
    props: IRdxAtomNode<GModel>
  ): [GModel, TNext<GModel>, DataContext<GModel>, RdxAtomNode<GModel>] {
    const rdxAtom = new RdxAtomNode(props);
    const dataContext = useRdxNodeBinding<GModel>(rdxAtom);
    useStateUpdate(rdxAtom.getId(), StateUpdateType.ReactionStatus);
    return [dataContext.value, dataContext.next, dataContext, rdxAtom];
  }

  function useRdxRefrence<GModel>(id: string) {
    return useRdxNodeBinding<GModel>(id);
  }
  function useRdxWatcher<GModel>(props: IRdxWatcherNode<GModel>, deps?: any[]) {
    const newProps = { ...props };
    // 这里通过rdxWatcher实现类比WatcherFamily的功能
    if (deps && Array.isArray(deps)) {
      newProps.id = `${newProps.id}__watcher/${JSON.stringify(deps)}`;
    }
    const dataContext = useRdxNodeBinding(new RdxWatcherNode(newProps));
    return [dataContext.value, dataContext.next] as [GModel, TNext<GModel>];
  }

  function useRdxWatcherLoader<GModel>(
    props: IRdxWatcherNode<GModel>,
    deps?: string[]
  ): [GModel, TNext<GModel>, DataContext<GModel>] {
    const newProps = { ...props };
    // 这里通过rdxWatcher实现类比WatcherFamily的功能
    if (deps && Array.isArray(deps)) {
      newProps.id = `${newProps.id}__watcher/${JSON.stringify(deps)}`;
    }
    const watcher = new RdxWatcherNode(newProps);
    useStateUpdate(watcher.getId(), StateUpdateType.ReactionStatus);
    const dataContext = useRdxNodeBinding<GModel>(watcher);
    return [dataContext.value, dataContext.next, dataContext];
  }
  function useRdxGlobalContext() {
    const context = useRdxStateContext(provider);
    useGlobalStateUpdate(context);
    return {
      taskState: context.getAllTaskState(),
      virtualTaskState: context.getAllVirtualTaskState(),
    };
  }
  function useRdxGlboalState() {
    const context = useRdxStateContext(provider);
    useGlobalStateUpdate(context);
    return context.getAllTaskState();
  }
  // =======================================基础hooks=========================================================
  function useRdxState<GModel>(
    props: RdxNode<GModel> | string
  ): [GModel, (v: GModel) => void] {
    const context = useRdxNodeBinding<GModel>(props);
    return [context.value, context.next];
  }

  function useRdxSetter<GModel>(props: RdxNode<GModel> | string) {
    const context = useRdxNodeBinding<GModel>(props);
    return context.next;
  }
  function useRdxStateLoader<GModel>(
    node: RdxNode<GModel> | string
  ): [Status, GModel, (v: GModel) => void] {
    const context = useRdxNodeBinding<GModel>(node);
    useStateUpdate(getDepId(node), StateUpdateType.ReactionStatus);
    return [context.status, context.value, context.next];
  }

  function useRdxValue<GModel>(node: RdxNode<GModel> | string): GModel {
    let context = useRdxNodeBinding<GModel>(node);
    return context.value;
  }

  function useRdxValueLoader<GModel>(node: RdxNode<GModel>): [Status, any] {
    const context = useRdxNodeBinding(node);
    useStateUpdate(getDepId(node), StateUpdateType.ReactionStatus);
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
    const context = useRdxWatcher({
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
    useRdxWatcher,
    useRdxWatcherLoader,
    useRdxGlboalState,
    useRdxGlobalContext,
    useRdxRefrence,
    useRdxState,
    useRdxValue,
    useRdxStateLoader,
    useRdxValueLoader,
    useRdxValueByDependencies,
    useRdxSetter,
  };
}

const defaultHooks = createRdxHooks();
export const useRdxAtom = defaultHooks.useRdxAtom;
export const useRdxAtomLoader = defaultHooks.useRdxAtomLoader;
export const useRdxWatcher = defaultHooks.useRdxWatcher;
export const useRdxWatcherLoader = defaultHooks.useRdxWatcherLoader;
export const useRdxGlboalState = defaultHooks.useRdxGlboalState;
export const useRdxRefrence = defaultHooks.useRdxRefrence;
export const useRdxState = defaultHooks.useRdxState;
export const useRdxValue = defaultHooks.useRdxValue;
export const useRdxStateLoader = defaultHooks.useRdxStateLoader;
export const useRdxValueLoader = defaultHooks.useRdxValueLoader;
export const useRdxValueByDependencies = defaultHooks.useRdxValueByDependencies;
export const useRdxSetter = defaultHooks.useRdxSetter;
