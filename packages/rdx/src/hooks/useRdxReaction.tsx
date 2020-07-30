import { useContext, useRef, useEffect, useMemo, useCallback } from 'react';
import { ShareContextInstance, TaskStatus } from '../RdxContext/shareContext';
import {
  IRdxReactionProps,
  StateUpdateType,
  IRdxState,
} from '../global';
import { useStateUpdate, useTaskInit, useTaskUpdate } from './useTaskHooks';

let reactionId = 0;
export function useRdxReaction<IModel, IRelyModel, IModuleConfig>(
  props: IRdxReactionProps<IModel, IRelyModel, IModuleConfig>
): [ TaskStatus] {
  const uniqueId = useRef('reaction-' + reactionId++);
  const context = useContext(ShareContextInstance);
  const { deps: deps, reaction, recordStatus, reactionType } = props;
  useEffect(() => {
    context.addOrUpdateTask(uniqueId.current, {
      id: uniqueId.current,
      deps: deps,
      reaction,
      recordStatus,
      reactionType,
    }, { notifyTask: false, notifyView: true});
  });

  // useStateUpdate(uniqueId.current, context, StateUpdateType.ReactionStatus);
  return [context.taskStatus.get(uniqueId.current)];
}

// export  function  useRdxDepsState(props: IRdxReactionProps<IModel, IRelyModel, IModuleConfig>) {
//   const uniqueId = useRef('reaction-' + reactionId++);
//   const context = useContext(ShareContextInstance);
//   const { deps: deps, reaction, recordStatus, reactionType } = props;
// }
export type ISetState<IModel> = IModel | ((state: IModel) => IModel);
export function useRdxState<IModel, IAction>(
  props: IRdxState<IModel, IAction>
): [IModel, (state: ISetState<IModel> ) => void, (action: IAction) => void] {
  const context = useContext(ShareContextInstance);
  const { id, defaultValue, reducer } = props;
  useTaskInit({
    context,
    id,
    defaultValue,
    reducer
  })
  useTaskUpdate({
    context,
    id,
    defaultValue,
    reducer
  })
  useStateUpdate(id, context, StateUpdateType.State);
  return [
    context.taskState.get(id),
    (state: ISetState<IModel>) => {
      let newState = state;
      if (typeof state == 'function') {
        newState = (state as (state: IModel) => IModel)(
          context.getTaskState(id, undefined)
        );
      }
      context.next(id, newState)
    },
    (action: IAction) => {
      context.dispatchAction(id, action);
    },
  ];
}

function  setState<IModel> (id: string)  {
  const context = useContext(ShareContextInstance);
  return useCallback(() => {
    (state: ISetState<IModel>) => {
      let newState = state;
      if (typeof state == 'function') {
        newState = (state as (state: IModel) => IModel)(
          context.getTaskState(id, undefined)
        );
      }
      context.next(id, newState)
    }
  }, [])
}