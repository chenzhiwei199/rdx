import React, { useImperativeHandle, useContext } from 'react';
import {
  NodeStatus,
  RENDER_STATUS,
  IBase,
  DataContext,
  StateUpdateType,
  IMutators,
} from '../global';
import { useState } from 'react';
import {
  ShareContextConsumer,
  ShareContextClass,
  DeliverOptions,
  ShareContextInstance,
} from '../RdxContext/shareContext';
import { TargetType, ActionType } from '../RdxContext/interface';
import {
  useTaskInit,
  useTaskUpdate,
  useStateUpdate,
  useMount,
} from '../hooks/useTaskHooks';
import { createBaseContext } from '../utils';

export type BaseModuleProps<IModel, IRelyModel, IAction> = IBase<
  IModel,
  IRelyModel,
  IAction
> & { context: ShareContextClass<IModel, IRelyModel> };


const _WithForwardView: any = React.forwardRef(<IModel, IRelyModel , IAction >(
  props: IBase<IModel, IRelyModel, IAction>,
  ref: React.Ref<IMutators<any>>
) => {
  const context = useContext<ShareContextClass<IModel, IRelyModel>>(ShareContextInstance)
  useImperativeHandle(ref, () => (createMutators(props.id, context)));
  return <Module {...props} context={context} />;
});

// forward类型转换，增强易用性
type WithForwardRefProps<IModel, IRelyModel , IAction> = {
  // ref wouldn't be a valid prop name 
  forwardedRef?: React.Ref<IMutators<IModel>>;
} & IBase<IModel, IRelyModel , IAction>;

export const WithForwardRef = <IModel, IRelyModel , IAction>({
  forwardedRef,
  ...rest
}: WithForwardRefProps<IModel, IRelyModel , IAction>) => (
  <_WithForwardView {...rest} ref={forwardedRef} />
);

export default WithForwardRef;
function Module<IModel, IRelyModel, IAction>(
  props: BaseModuleProps<IModel, IRelyModel, IAction>
) {
  const { id, scope, defaultValue } = props;
  // 设置默认值
  const mount = useMount();
  if (
    !mount.current &&
    defaultValue !== undefined &&
    props.context.getTaskState(id, scope) === undefined
  ) {
    props.context.udpateState(
      id,
      ActionType.Update,
      TargetType.TaskState,
      defaultValue
    );
  }

  useTaskInit(props);
  useTaskUpdate(props);
  return <MomeAtomComponent<IModel, IRelyModel, IAction> {...props} />;
}

/**
 *
 * @param props 原子组件，除非id改变，否则只能接受内部控制渲染
 */
function AtomComponent<IModel, IRelyModel, IAction>(
  props: BaseModuleProps<IModel, IRelyModel, IAction>
): React.ReactElement {
  const { id, context } = props;
  const taskInfo = context.tasksMap.get(id);
  const { render, component, scope } = taskInfo ? taskInfo : props;
  // 移入context中，这里只是发个消息，否则用来执行的不一定是最终状态
  useStateUpdate(id, context, StateUpdateType.State);
  useStateUpdate(id, context, StateUpdateType.ReactionStatus);

  const data: DataContext<IModel, IRelyModel> = {
    ...createBaseContext(id, context, props),
    ...createMutators(id, context),
  };
  const Component = component;
  if (component) {
    return <Component {...data} />;
  }
  return <>{render ? (render(data) as React.ReactNode) : null}</>;
}

const isLoading = <IModel, IRelyModel>(
  context: ShareContextClass<IModel, IRelyModel>,
  id: string
) => {
  return context.taskStatus.get(id)?.value === NodeStatus.Waiting;
};

function createMutators<IModel, IRelyModel>(
  id: string,
  context: ShareContextClass<IModel, IRelyModel>
) {
  return {
    next: (selfValue: IModel, options?: DeliverOptions) => {
      context.next(id, selfValue, options);
    },
    dispatchById: (id: string, action, options) => {
      context.dispatchAction(id, action, options);
    },
    dispatch: (action, options) => {
      context.dispatchAction(id, action, options);
    },
    refreshView: () => {
      context.notifyModule(id);
    },
    nextById: (id, selfValue, options?: DeliverOptions) => {
      context.next(id, selfValue, options);
    },
    // ? 这里应该加上scope， 刷新只刷新作用域下面的
    refresh: context.refresh.bind(null, id),
    loading: isLoading(context, id),
    // TODO: 其他组件中的默认值， 怎么获取
    mergeScopeState2Global: () => {
      context.mergeScopeState2Global(id);
    },
  };
}
class MomeAtomComponent<IModel, IRelyModel, IAction> extends React.Component<
  BaseModuleProps<IModel, IRelyModel, IAction>
> {
  shouldComponentUpdate(nextProps) {
    return this.props.id !== nextProps.id;
  }
  render() {
    const { context, ...rest } = this.props;
    return (
      <AtomComponent<IModel, IRelyModel, IAction>
        context={context as any}
        {...rest}
      />
    );
  }
}

export const useForceUpdate = () => {
  const [state, setState] = useState(1);
  return () => {
    setState((state) => state + 1);
  };
};
