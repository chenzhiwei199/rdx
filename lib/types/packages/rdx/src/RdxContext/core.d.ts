export interface Base<T> {
    remove(key: string, scope?: string): void;
    update(key: string, value: T, scope?: string): void;
    get(key: string, scope?: string): T | null;
    getAll(): any;
    clone(): Base<T>;
    merge(scope: string): void;
}
export declare class BaseMap<T extends Object> implements Base<T> {
    clone(): Base<T>;
    merge(scope: string): void;
    v: Map<string, T | null>;
    constructor(v: Map<string, T | null>);
    get(key: string, scope?: string): T;
    removeAll(): void;
    remove(rkey: string, scope?: string): void;
    update(key: string, value: T, scope?: string): this;
    getAll(): Map<string, T>;
}
export declare class BaseObject<T extends Object> implements Base<T> {
    constructor(v: {
        [key: string]: T | null;
    });
    v: {
        [key: string]: T | null;
    };
    remove(key: string, scope?: string): void;
    merge(scope: string): void;
    clone(): BaseObject<T>;
    getAll(): {
        [key: string]: T;
    };
    get(key: string, scope?: string): T;
    update(key: string, value: T, scope?: string): any;
}
export declare class ScopeObject<T extends Object> extends BaseObject<T> {
    scopeEditState: Map<string, BaseObject<T>>;
    constructor(v: {
        [key: string]: T | null;
    }, scopeState?: Map<string, BaseObject<T>>);
    getCurrentScopeState(scope?: string): BaseObject<T>;
    hasScopeState(scope?: string): boolean;
    get(key: string, scope?: string): T;
    remove(key: string, scope?: string): void;
    merge(scope: any): void;
    clone(): any;
    update(key: any, value: any, scope: any): void;
}
