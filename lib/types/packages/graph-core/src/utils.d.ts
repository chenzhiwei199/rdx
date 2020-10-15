import { Point } from './typings/global';
/**
 * 根据依赖，需要发送通知的下游节点
 * @param config
 */
export declare function createDeliversMap(config: Point[]): Map<string, string[]>;
export declare function createConfigMap<T extends {
    key: string;
}>(config: T[]): Map<string, T>;
export declare function normalizeSingle2Arr<T>(point: T | T[]): T[];
export declare function arr2Map<T>(source: T[], getKey: (v: T) => string): Map<string, T>;
export declare function union<T>(source: T[], byKey?: (v: T) => string): any[];
export interface Data {
    id: string;
    deps?: {
        id: string;
        weight?: number;
    }[];
}
declare const _default: {
    normalizeSingle2Arr: typeof normalizeSingle2Arr;
    createConfigMap: typeof createConfigMap;
    createDeliversMap: typeof createDeliversMap;
};
export default _default;
