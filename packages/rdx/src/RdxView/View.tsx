import React from 'react';
import {
  NodeStatus,
  RENDER_STATUS,
  IBase,
  DataContext,
  StateUpdateType,
} from '../global';
import {  useState } from 'react';
import {
  ShareContextConsumer,
  ShareContextClass,
  DeliverOptions,
} from '../RdxContext/shareContext';
import { TargetType, ActionType } from '../RdxContext/interface';
import {
  useTaskInit,
  useTaskUpdate,
  useStateUpdate,
  useMount,
} from '../hooks/useTaskHooks';
import { createBaseContext } from '../utils';

export type BaseModuleProps<IModel, IRelyModel, IModuleConfig, IAction> = IBase<
  IModel,
  IRelyModel,
  IModuleConfig,
  IAction
> & { context: ShareContextClass<IModel, IRelyModel, IModuleConfig> };

export default <IModel, IRelyModel, IModuleConfig, IAction>(
  props: IBase<IModel, IRelyModel, IModuleConfig, IAction>
) => {
  return (
    <ShareContextConsumer>
      {(context: ShareContextClass<IModel, IRelyModel, IModuleConfig>) => {
        return <Module {...props} context={context} />;
      }}
    </ShareContextConsumer>
  );
};

function Module<IModel, IRelyModel, IModuleConfig, IAction>(
  props: BaseModuleProps<IModel, IRelyModel, IModuleConfig, IAction>
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
  return (
    <MomeAtomComponent<IModel, IRelyModel, IModuleConfig, IAction> {...props} />
  );
}

const isLoading = <IModel, IRelyModel, IModuleConfig, IAction>(
  props: BaseModuleProps<IModel, IRelyModel, IModuleConfig, IAction>
) => {
  return props.context.taskStatus.get(props.id)?.value === NodeStatus.Waiting;
};

/**
 *
 * @param props 原子组件，除非id改变，否则只能接受内部控制渲染
 */
function AtomComponent<IModel, IRelyModel, IModuleConfig, IAction>(
  props: BaseModuleProps<IModel, IRelyModel, IModuleConfig, IAction>
): React.ReactElement {
  const { id, context } = props;
  const taskInfo = context.tasksMap.get(id);
  const { render, moduleConfig, deps, component, scope } = taskInfo
    ? taskInfo
    : props;
  // 移入context中，这里只是发个消息，否则用来执行的不一定是最终状态
  useStateUpdate(id, context, StateUpdateType.State);
  useStateUpdate(id, context, StateUpdateType.ReactionStatus);

  const data: DataContext<IModel, IRelyModel, IModuleConfig> = {
    ...createBaseContext(id, context, props),
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
    loading: isLoading(props),
    // TODO: 其他组件中的默认值， 怎么获取
    mergeScopeState2Global: () => {
      context.mergeScopeState2Global(id);
    },

    value: context.taskState.get(id, scope),
    status:
      context.taskStatus.get(id) && context.taskStatus.get(id).value
        ? context.taskStatus.get(id).value
        : RENDER_STATUS.FirstRender,
    errorMsg: (context.taskStatus.get(id) || {}).errorMsg,

    // ? 这里应该加上scope， 刷新只刷新作用域下面的
    refresh: context.refresh.bind(null, id),
  };
  const Component = component;
  if (component) {
    return <Component {...data} />;
  }
  return <>{render ? (render(data) as React.ReactNode) : null}</>;
}

class MomeAtomComponent<
  IModel,
  IRelyModel,
  IModuleConfig,
  IAction
> extends React.Component<
  BaseModuleProps<IModel, IRelyModel, IModuleConfig, IAction>
> {
  shouldComponentUpdate(nextProps) {
    return this.props.id !== nextProps.id;
  }
  render() {
    const { context, ...rest } = this.props;
    return (
      <AtomComponent<IModel, IRelyModel, IModuleConfig, IAction>
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
