import { ActionType, TargetType } from '../RdxContext/interface';
import { useEffect, useRef, useContext, useMemo } from 'react';
import { ShareContextInstance } from '../RdxContext/shareContext';
import {
  StateUpdateType,
  IRdxView,
  DataContext,
  IRdxViewBase,
  Status,
} from '../global';
import { RdxNode } from '../RdxValues';
import { usePrevious } from './base';
import {
  createBaseContext,
  createMutators,
  getDepId,
} from '../utils/taskUtils';
import shallowEqual from 'shallowequal';
import { isPromise } from '../utils';
import { useStateUpdate, createStore } from './hookUtils';

export type IRdxStateHook<IModel, IRelyModel> = IRdxViewBase<
  IModel,
  IRelyModel
> & { id: string };

export function useDefaultValue<IModel, IRelyModel>() {}

// export function useRdxContext<IModel, IRelyModel>(
//   props: IRdxStateHook<IModel, IRelyModel>
// ) {
//   const context = useContext(ShareContextInstance);
//   useTaskBinding<IModel>({ ...props });
//   useStateUpdate(props.id, context, StateUpdateType.ReactionStatus);
//   useStateUpdate(props.id, context, StateUpdateType.State);
//   const data: DataContext<IModel, IRelyModel> = {
//     ...createBaseContext(props.id, context, props),
//     ...createMutators(props.id, context),
//   };
//   return data;
// }

// let reactionPreviewId = 0;
// export function useRdxContextAutoId<IModel, IRelyModel>(
//   props: IRdxViewBase<IModel, IRelyModel> & { displayName?: string }
// ) {
//   const { displayName, ...rest } = props;
//   const uniqueId = useRef(`${displayName}-preview` + reactionPreviewId++);
//   return useRdxContext({ ...rest, id: uniqueId.current });
// }

function getId<IModel, IRelyModel>(
  props: IRdxView<IModel, IRelyModel> | RdxNode<IModel>
) {
  if (props instanceof RdxNode) {
    return props.getId();
  } else {
    return props.id;
  }
}

export function useUpdate<IModel, IRelyModel>(
  props: IRdxView<IModel, IRelyModel> | RdxNode<IModel>
) {
  const preProps = usePrevious(props);
  const isMount = !!preProps;
  const isUpdate = isMount && getId(preProps) !== getId(props);
  return { isMount, isUpdate, preProps };
}
export function useAddOrUpdateTask<IModel, IRelyModel>(props: RdxNode<IModel>) {
  const context = useContext(ShareContextInstance);
  const { isMount, isUpdate, preProps } = useUpdate(props);
  const [get, set] = createStore();
  // ?移除，内存泄漏,taskMap的数量
  // if (isUpdate) {
  //   context.udpateState(
  //     getId(preProps),
  //     ActionType.Remove,
  //     TargetType.TasksMap
  //   );
  // }

  useMemo(() => {
    if (!context.hasTask(props.getId())) {
      props.load(context);
    }

    // 初始化默认值
    // if (context.getTaskState(id) === undefined) {
    //   const willUpdateValue =
    //     defaultValue || (!isPromise(get()) && get() && get().value);
    //   context.udpateState(
    //     id,
    //     ActionType.Update,
    //     TargetType.TaskState,
    //     willUpdateValue
    //   );
    // }

    // 更新状态
    // if (isPromise(get())) {
    //   context.setTaskStatus(props.getId(), { value: Status.Waiting });
    // } else {
    //   const notPrepareFinish = (get().deps || []).some(
    //     (dep) =>
    //       context.getTaskStatus(getDepId(dep)) &&
    //       context.getTaskStatus(getDepId(dep)).value !== Status.IDeal
    //   );
    //   // 依赖节点还未准备好
    //   if (notPrepareFinish) {
    //     context.setTaskStatus(props.getId(), { value: Status.Waiting });
    //   } else {
    //     // 依赖节点准备好了
    //     context.setTaskState(props.getId(), get());
    //   }
    // }
    // 第一次绑定，或者id更新
    // let isNotifyTask: boolean =
    //   !isMount || isUpdate ? props.isNotifyTask(get) : false;
  }, [props.getId()]);
}
export function useTaskBinding<IModel>(props: RdxNode<IModel>) {
  // 1. 初始化的时候根据atom 默认值类型判断是否是异步任务，判断是否要重跑任务
  // 2. 根据get是否是异步任务，判断是否需要重跑任务

  const context = useContext(ShareContextInstance);
  if (!context.getTaskState) {
    throw new Error('使用rdx的组件必须为rdxContext子孙组件');
  }
  // 注册节点
  useAddOrUpdateTask(props);
  useEffect(() => {
    return () => {
      //  卸载节点，检查依赖&warning
      context.udpateState(getId(props), ActionType.Remove, TargetType.TasksMap);
    };
  }, []);
}

/**
 * 绑定rdxNode到context中, 并绑定状态了状态
 * @param node
 */
export function useRdxNodeBinding<IModel, IRelyModel>(node: RdxNode<IModel>) {
  const context = useContext(ShareContextInstance);
  useTaskBinding(node);
  useStateUpdate(getDepId(node), context, StateUpdateType.State);
  const data: DataContext<IModel, IRelyModel> = {
    ...createBaseContext(getDepId(node), context),
    ...createMutators(getDepId(node), context),
  };
  return data;
}
