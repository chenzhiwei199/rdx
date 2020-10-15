import { ShareContextClass } from '../RdxContext/shareContext';
export declare enum RdxNodeType {
    Atom = "atom",
    Watcher = "watcher",
    Mixed = "mixed",
    WatcherFamily = "watcherFamily",
    Reaction = "reaction"
}
export interface IRdxNode {
    id: string;
    type?: RdxNodeType;
}
export interface IRdxNodeLifeCycle {
    load(context: ShareContextClass): void;
}
/**
 * 基础节点
 */
export declare class RdxNode<GModel> implements IRdxNodeLifeCycle {
    load(context: ShareContextClass): void;
    id: string;
    virtual?: boolean;
    type: RdxNodeType;
    constructor(config: IRdxNode);
    getType(): RdxNodeType;
    getId(): string;
    reset(context: ShareContextClass): void;
}
export declare class RdxNode2<GModel> implements IRdxNodeLifeCycle {
    load(context: ShareContextClass): void;
    private id;
    private type;
    constructor(config: IRdxNode);
    getType(): RdxNodeType;
    getId(): string;
}
export declare type TPath<GModel> = RdxNode<GModel> | string;
export declare type ValueOrUpdater<GModel> = ((preValue: GModel) => GModel) | GModel;
export declare type RdxGet = <GModel>(node: TPath<GModel>) => GModel;
export declare type RdxSet = <GModel>(node: TPath<GModel>, value: ValueOrUpdater<GModel>) => void;
export declare type RdxReset = <GModel>(node: RdxNode<GModel>) => void;
export declare type get = <ISource, IPath>(node: IPath) => ISource[];
