import {  RdxNode, IRdxNode } from "./base";
import { IRdxWatcherGet, IRdxWatcherSet } from "./RdxWatcher/types";
import { RdxWatcherNode } from "./RdxWatcher";
import { useRdxAtomLoader, useRdxSetter, useRdxState, useRdxNodeBinding } from '../hooks/stateHooks';
import { RdxAtomNode } from './rdxAtom';

export interface IRdxWatcherFamilyOperate<GModel, GParams> {
  get: (params: GParams) => IRdxWatcherGet<GModel>;
  set?: (params: GParams) => IRdxWatcherSet<GModel>;
}
export type IRdxWatcherFamilyNode<GModel, GParams> = IRdxNode & IRdxWatcherFamilyOperate<GModel, GParams>;

let watcherFamilyCount = 0
export function rdxWatcherFamily<GModel, GParams>(config: IRdxWatcherFamilyNode<GModel, GParams>) {
  const { id, get, set } = config
  const depId = `${id}_watcherFamily/${watcherFamilyCount++}`
  const relyAtom = new RdxAtomNode({
    id: depId,
    defaultValue: null
  })
  
  const rdxWatchNode = new RdxWatcherNode({
    id: id,
    get: (...args) => {
        const { get: innerGet} = args[0]
        return get(innerGet(depId))(args[0] as any)
    },
    set: set? (...args) => {
      const { get: innerGet} = args[0]
      set(innerGet(depId))(args[0] as any, args[1] as any)
    }: undefined
  })
  return (params: GParams) => {
    const  context = useRdxNodeBinding<GParams>(relyAtom, false)
    if(params !== context.value) {
      context.next(params)
    }
    
    // return new RdxWatcherNode({
    //   ...config,
    //   id: `${id}_watcherFamily/${JSON.stringify(params)}`,
    //   get: get(params),
    //   set: set && set(params)
    // }) as RdxNode<GModel>
    return rdxWatchNode as RdxNode<GModel>
  };
}


