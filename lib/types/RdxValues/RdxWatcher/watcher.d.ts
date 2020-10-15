import { RdxNode } from '../base';
import { ShareContextClass } from '../../RdxContext/shareContext';
import { IRdxTask } from '../../global';
import { IRdxWatcherGet, IRdxWatcherNode, IRdxWatcherOperate, IRdxWatcherSet } from './types';
export declare class RdxWatcherNode<GModel> extends RdxNode<GModel> implements IRdxWatcherOperate<GModel> {
    get: IRdxWatcherGet<GModel>;
    set?: IRdxWatcherSet<GModel>;
    defaultValue: GModel;
    virtual?: boolean;
    constructor(config: IRdxWatcherNode<GModel>);
    fireGetFuncCount: number;
    reactionCount: number;
    /**
     * get调用标记
     */
    fireGet(): void;
    isSync(context: ShareContextClass): boolean;
    getTaskInfo(context: ShareContextClass): IRdxTask<any>;
    reset(context: ShareContextClass): void;
    init(context: ShareContextClass, force?: boolean): void;
    load(context: ShareContextClass): void;
}
export declare function watcher<GModel>(config: IRdxWatcherNode<GModel>): RdxNode<GModel>;
