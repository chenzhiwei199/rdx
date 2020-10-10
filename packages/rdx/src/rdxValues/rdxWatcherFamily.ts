import {  RdxNode, IRdxNode } from "./base";
import { IRdxWatcherGet, IRdxWatcherSet } from "./RdxWatcher/types";
import { RdxWatcherNode } from "./RdxWatcher";

export interface IRdxWatcherFamilyOperate<GModel, GParams> {
  get: (params: GParams) => IRdxWatcherGet<GModel>;
  set?: (params: GParams) => IRdxWatcherSet<GModel>;
}
export type IRdxWatcherFamilyNode<GModel, GParams> = IRdxNode & IRdxWatcherFamilyOperate<GModel, GParams>;

export function rdxWatcherFamily<GModel, GParams>(config: IRdxWatcherFamilyNode<GModel, GParams>) {
  return (params: GParams) => {
    const {id ,get , set} = config
    return new RdxWatcherNode({
      ...config,
      id: `${id}_watcherFamily/${JSON.stringify(params)}`,
      get: get && get(params),
      set: set && set(params)
    })
  };
}


