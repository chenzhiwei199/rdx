import { IRdxAnyDeps, RdxWatcherNode, ShareContextClass } from '../..';
export declare enum WatcherErrorType {
    DepsNotReady = "DepsNotReady"
}
/**
 * 检查依赖是否改变
 * @param preDeps
 * @param nextDeps
 */
export declare function isDepsChange(preDeps?: IRdxAnyDeps[], nextDeps?: IRdxAnyDeps[]): boolean;
/**
 * 核心： 通过执行watcher.get方法来收集依赖关系。
 * 通过传入 watcher和 ShareContextClass， 来获取依赖关系和预计算值
 * @export
 * @param {RdxNode} watcher
 * @param {ShareContextClass<any, any>} context
 * @param {boolean} force 如果force 为true，则会强制检查更新，如果force为false，则会检查缓存，如果有缓存则不检查更新
 * @returns
 */
export declare function detectValueAndDeps<GModel>(watcher: RdxWatcherNode<GModel>, context: ShareContextClass, force?: boolean, loggerInfo?: string): void;
export declare class NullTag {
}
export declare function isNullTag(value: any): boolean;
export declare const createWatcherMutators: (context: ShareContextClass, watcher: RdxWatcherNode<any>) => {
    id: string;
    set: (atom: any, value: any) => void;
    get: (atom: any) => any;
    reset: (atom: any) => void;
    hasCache: () => boolean;
    setCache: (value: any) => void;
    deleteCache: () => void;
    getCache: () => import("../..").StoreValues<any>;
    checkAndUpdateDeps: () => void;
};
export declare function uniqBy<T>(arr: T[], getValue: (pre: T) => any): T[];
