import { Status, IRdxAnyDeps } from '../global';
import { RdxNode } from '../RdxValues/base';
import {
  IRdxAtomNode,
  RdxAtomNode,
  IRdxWatcherNode,
  RdxWatcherNode,
} from '../RdxValues';
import { useRef } from 'react';
import { useRdxNodeBinding } from './useTaskHooks';

// ?当依赖的组件移除了怎么办，为啥共享组件数据的时候，数据需要提到父级， 因为当组件移除的情况下，父级组件用户可以主动的控制
export function useRdxAtom<IModel>(props: IRdxAtomNode<IModel>) {
  const rdxAtom = new RdxAtomNode(props);
  const dataContext = useRdxNodeBinding(rdxAtom);
  return [dataContext.value, dataContext.next] as [IModel, (v: IModel) => void];
}

export function useRdxWatcher<IModel>(props: IRdxWatcherNode<IModel>) {
  const dataContext = useRdxNodeBinding(new RdxWatcherNode(props));
  return [dataContext.value, dataContext.next] as [IModel, (v: IModel) => void];
}

export function useRdxWatcherLoader<IModel>(props: IRdxWatcherNode<IModel>) {
  const dataContext = useRdxNodeBinding(new RdxWatcherNode(props));
  if (dataContext.status === Status.Error) {
    return [dataContext.status, dataContext.errorMsg];
  }
  return [dataContext.status, dataContext.value, dataContext.next];
}

// export function useRdxReaction<IModel>(
//   props: IRdxReactionNode<IModel> & {
//     rerunWhenDepsChange?: boolean;
//   }
// ) {
//   const context = useContext(ShareContextInstance);
//   const dataContext = useRdxContext(
//     new RdxReactionNode({ ...props }).createNodeInfo(context)
//   );
//   return [dataContext.value, dataContext.next];
// }
// =======================================基础hooks=========================================================
export function useRdxState<IModel>(
  props: RdxNode<IModel>
): [IModel, (v: IModel) => void] {
  const context = useRdxNodeBinding<IModel, any>(props);
  return [context.value, context.next];
}

export function useRdxStateLoader<IModel>(
  node: RdxNode<IModel>
): [Status, IModel, (v: IModel) => void] {
  const context = useRdxNodeBinding<IModel, any>(node);
  return [context.status, context.value, context.next];
}

export function useRdxValue<IModel>(node: RdxNode<IModel>): IModel {
  let context = useRdxNodeBinding<IModel, any>(node);
  return context.value;
}

export function useRdxValueLoader<IModel>(
  node: RdxNode<IModel>
): [Status, any] {
  const context = useRdxNodeBinding(node);
  return [context.status, context.value];
}

// =======================================基础hooks=========================================================
let reactionPreviewId = 0;
export function useRdxValueByDependencies<IRelyModel>(props: {
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
