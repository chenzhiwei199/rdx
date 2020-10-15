import { RdxNode, IRdxNode } from "./base";
import { IRdxWatcherGet, IRdxWatcherSet } from "./RdxWatcher/types";
export interface IRdxWatcherFamilyOperate<GModel, GParams> {
    get: (params: GParams) => IRdxWatcherGet<GModel>;
    set?: (params: GParams) => IRdxWatcherSet<GModel>;
}
export declare type IRdxWatcherFamilyNode<GModel, GParams> = IRdxNode & IRdxWatcherFamilyOperate<GModel, GParams>;
export declare function rdxWatcherFamily<GModel, GParams>(config: IRdxWatcherFamilyNode<GModel, GParams>): (params: GParams) => RdxNode<GModel>;
