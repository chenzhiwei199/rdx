import React, { useImperativeHandle, useContext } from 'react';
import {
  IRdxView,
  DataContext,
  StateUpdateType,
  IMutators,
} from '../global';
import { useState } from 'react';
import {
  ShareContextClass,
  ShareContextInstance,
} from '../RdxContext/shareContext';
import { TargetType, ActionType } from '../RdxContext/interface';
import {
  useTaskInit,
  useTaskUpdate,
  useStateUpdate,
  useMount,
} from '../hooks/useTaskHooks';
import { createBaseContext, createMutators } from '../utils';

export type BaseModuleProps<IModel, IRelyModel, IAction> = IRdxView<
  IModel,
  IRelyModel,
  IAction
> & { context: ShareContextClass<IModel, IRelyModel> };


// 使用React.forwardRef,兼容typescript 类型定义
const _WithForwardView: any = React.forwardRef(<IModel, IRelyModel , IAction >(
  props: IRdxView<IModel, IRelyModel, IAction>,
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
} & IRdxView<IModel, IRelyModel , IAction>;

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
  const { render, component } = taskInfo ? taskInfo : props;
  // 移入context中，这里只是发个消息，否则用来执行的不一定是最终状态
  useStateUpdate(id, context, StateUpdateType.State);

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
