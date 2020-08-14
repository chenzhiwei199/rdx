import { useContext, useRef } from 'react';
import { ShareContextInstance } from '../RdxContext/shareContext';
import { DataContext, IRdxViewBase, IRdxView } from '../global';
import { useTaskBinding } from './useTaskHooks';
import { createBaseContext, createMutators } from '../utils';

export type IRdxStateHook<IModel, IRelyModel, IAction> = IRdxViewBase<
  IModel,
  IRelyModel,
  IAction
> & { id: string };
export type IRdxPreviewHook<IModel, IRelyModel, IAction> = IRdxViewBase<
  IModel,
  IRelyModel,
  IAction
>;

//
export function useRdxState<IModel, IRelyModel, IAction>(
  props: IRdxStateHook<IModel, IRelyModel, IAction>
): [IModel, (v: IModel) => void] {
  const context = useRdxContext(props);
  return [context.value, context.next];
}

export function useRdxContext<IModel, IRelyModel, IAction>(
  props: IRdxStateHook<IModel, IRelyModel, IAction>
) {
  const context = useContext(ShareContextInstance);
  useTaskBinding<IModel, IRelyModel, IAction>({ ...props, context });
  const data: DataContext<IModel, IRelyModel> = {
    ...createBaseContext(props.id, context, props),
    ...createMutators(props.id, context),
  };
  return data;
}

let reactionPreviewId = 0;
export function useRdxContextAutoId<IModel, IRelyModel, IAction>(
  props: IRdxPreviewHook<IModel, IRelyModel, IAction>
) {
  const uniqueId = useRef('reaction-' + reactionPreviewId++);
  return useRdxContext({ ...props, id: uniqueId.current });
}
