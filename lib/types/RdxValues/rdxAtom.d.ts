import { IRdxTask } from '../global';
import { IRdxNode, RdxNode, IRdxNodeLifeCycle } from './base';
import { ShareContextClass } from '../RdxContext/shareContext';
export declare function atom<GModel>(config: IRdxAtomNode<GModel>): RdxNode<GModel>;
export interface IRdxAtomNode<GModel> extends IRdxNode {
    virtual?: boolean;
    defaultValue: GModel | Promise<GModel> | RdxNode<GModel>;
}
export declare function rdxNodeOperates(context: any, virtual: any): {
    getValue: (id: any) => any;
    setValue: (id: any, value: any) => any;
};
export declare class RdxAtomNode<GModel> extends RdxNode<GModel> implements IRdxNodeLifeCycle {
    private defaultValue;
    constructor(config: IRdxAtomNode<GModel>);
    getTaskInfo(context: ShareContextClass): IRdxTask<GModel>;
    init(context: ShareContextClass, force?: boolean): void;
    reset(context: ShareContextClass): void;
    load(context: ShareContextClass): void;
}
