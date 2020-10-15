/// <reference types="react" />
export declare function useMount(): import("react").MutableRefObject<boolean>;
export declare const useForceUpdate: () => () => void;
export declare function createStore(): [() => any, (v: any) => void];
