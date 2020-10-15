import { ShareContextClass, DeliverOptions } from '../RdxContext/shareContext';
import { BaseContext, IRdxTask, IRdxAnyDeps } from '../global';
export declare function getId(dep: IRdxAnyDeps): string;
export declare function getDepIds(deps?: IRdxAnyDeps[]): string[];
export declare function createBaseContext<GModel>(id: string, context: ShareContextClass, defaultTaskMap?: IRdxTask<GModel>): BaseContext<GModel>;
export declare function createMutators(id: string, context: ShareContextClass): {
    next: (selfValue: any, options?: DeliverOptions) => void;
    nextById: (id: any, selfValue: any, options?: DeliverOptions) => void;
    refresh: () => void;
    loading: boolean;
};
