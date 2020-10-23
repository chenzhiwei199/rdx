import { RdxState, IRdxBaseState } from './base';
import { IRdxComputeGet, IRdxComputeSet } from './RdxCompute/types';
import { RdxComputeNode } from './RdxCompute';
import { useRdxNodeBinding } from '../hooks/stateHooks';
import { RdxAtomNode } from './rdxAtom';

export interface IRdxComputeFamilyOperate<GModel, GParams> {
  get: (params: GParams) => IRdxComputeGet<GModel>;
  set?: (params: GParams) => IRdxComputeSet<GModel>;
}
export type IRdxComputeFamilyNode<GModel, GParams> = IRdxBaseState &
  IRdxComputeFamilyOperate<GModel, GParams>;

let computeFamilyCount = 0;
export function rdxComputeFamily<GModel, GParams>(
  config: IRdxComputeFamilyNode<GModel, GParams>
) {
  const { id, get, set } = config;
  const depId = `${id}_computeFamily/${computeFamilyCount++}`;
  const relyAtom = new RdxAtomNode({
    id: depId,
    defaultValue: null,
  });

  const rdxWatchNode = new RdxComputeNode({
    id: id,
    get: (...args) => {
      const { get: innerGet } = args[0];
      return get(innerGet(depId) as any)(args[0] as any);
    },
    set: set
      ? (...args) => {
          const { get: innerGet } = args[0];
          set(innerGet(depId) as any)(args[0] as any, args[1] as any);
        }
      : undefined,
  });
  return (params: GParams) => {
    const context = useRdxNodeBinding<GParams>(relyAtom, false);
    if (params !== context.value) {
      context.next(params);
    }

    // return new RdxComputeNode({
    //   ...config,
    //   id: `${id}_computeFamily/${JSON.stringify(params)}`,
    //   get: get(params),
    //   set: set && set(params)
    // }) as RdxNode<GModel>
    return rdxWatchNode as RdxState<GModel>;
  };
}
