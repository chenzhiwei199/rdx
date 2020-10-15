import { Status, IRdxAnyDeps, DataContext, TNext } from '../global';
import { RdxNode } from '../RdxValues/base';
import { IRdxAtomNode, RdxAtomNode, IRdxWatcherNode } from '../RdxValues';
import { ShareContextClass } from '../RdxContext/shareContext';
import React from 'react';
export declare function createRdxStaterContext(): React.Context<ShareContextClass>;
export declare const DefaultContext: React.Context<ShareContextClass>;
export declare function useRdxStateContext(context?: React.Context<ShareContextClass>): ShareContextClass;
export declare function createRdxHooks(provider?: React.Context<ShareContextClass>): {
    useRdxAtom: <GModel>(props: IRdxAtomNode<GModel>) => [GModel, (v: GModel) => void, RdxAtomNode<GModel>];
    useRdxAtomLoader: <GModel_1>(props: IRdxAtomNode<GModel_1>) => [GModel_1, TNext<GModel_1>, DataContext<GModel_1>, RdxAtomNode<GModel_1>];
    useRdxWatcher: <GModel_2>(props: IRdxWatcherNode<GModel_2>, deps?: any[]) => [GModel_2, TNext<GModel_2>];
    useRdxNodeBinding: <GModel_3>(node: string | RdxNode<GModel_3>, stateUpdate?: boolean) => DataContext<GModel_3>;
    useRdxWatcherLoader: <GModel_4>(props: IRdxWatcherNode<GModel_4>, deps?: string[]) => [GModel_4, TNext<GModel_4>, DataContext<GModel_4>];
    useRdxGlboalState: () => any;
    useRdxGlobalContext: () => {
        taskState: any;
        virtualTaskState: any;
    };
    useRdxRefrence: <GModel_5>(id: string) => DataContext<GModel_5>;
    useRdxState: <GModel_6>(props: string | RdxNode<GModel_6>) => [GModel_6, (v: GModel_6) => void];
    useRdxValue: <GModel_7>(node: string | RdxNode<GModel_7>) => GModel_7;
    useRdxStateLoader: <GModel_8>(node: string | RdxNode<GModel_8>) => [Status, GModel_8, (v: GModel_8) => void];
    useRdxValueLoader: <GModel_9>(node: RdxNode<GModel_9>) => [Status, any];
    useRdxValueByDependencies: <IRelyModel>(props: {
        displayName?: string;
        deps: IRdxAnyDeps[];
    }) => IRelyModel;
    useRdxSetter: <GModel_10>(props: string | RdxNode<GModel_10>) => TNext<GModel_10>;
    useRdxLoading: () => () => boolean;
};
export declare const useRdxAtom: <GModel>(props: IRdxAtomNode<GModel>) => [GModel, (v: GModel) => void, RdxAtomNode<GModel>];
export declare const useRdxAtomLoader: <GModel>(props: IRdxAtomNode<GModel>) => [GModel, TNext<GModel>, DataContext<GModel>, RdxAtomNode<GModel>];
export declare const useRdxWatcher: <GModel>(props: IRdxWatcherNode<GModel>, deps?: any[]) => [GModel, TNext<GModel>];
export declare const useRdxWatcherLoader: <GModel>(props: IRdxWatcherNode<GModel>, deps?: string[]) => [GModel, TNext<GModel>, DataContext<GModel>];
export declare const useRdxGlboalState: () => any;
export declare const useRdxRefrence: <GModel>(id: string) => DataContext<GModel>;
export declare const useRdxState: <GModel>(props: string | RdxNode<GModel>) => [GModel, (v: GModel) => void];
export declare const useRdxValue: <GModel>(node: string | RdxNode<GModel>) => GModel;
export declare const useRdxStateLoader: <GModel>(node: string | RdxNode<GModel>) => [Status, GModel, (v: GModel) => void];
export declare const useRdxValueLoader: <GModel>(node: RdxNode<GModel>) => [Status, any];
export declare const useRdxValueByDependencies: <IRelyModel>(props: {
    displayName?: string;
    deps: IRdxAnyDeps[];
}) => IRelyModel;
export declare const useRdxSetter: <GModel>(props: string | RdxNode<GModel>) => TNext<GModel>;
export declare const useRdxNodeBinding: <GModel>(node: string | RdxNode<GModel>, stateUpdate?: boolean) => DataContext<GModel>;
