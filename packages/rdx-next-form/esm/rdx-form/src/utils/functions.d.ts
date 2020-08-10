import { IFieldDefine } from '../global';
import React from 'react';
export declare function isPromise(obj: any): boolean;
export declare function getEmptyValue(fieldDefine: IFieldDefine): any;
export declare function getChlidFieldInfos(children: React.ReactNode): IFieldDefineWithChild[];
export interface IFieldDefineWithChild extends IFieldDefine {
    child: any;
}
export declare function getChlidFieldInfo(children: React.ReactNode): IFieldDefine & {
    children?: IFieldDefineWithChild[];
};
export declare const toArr: (val: any) => any[];
export declare const normalizeCol: (col: {
    span: number;
    offset?: number;
} | number, defaultValue?: {
    span: number;
}) => {
    span: number;
    offset?: number;
};
/**
*
* @param fn {Function}   实际要执行的函数
* @param delay {Number}  延迟时间，也就是阈值，单位是毫秒（ms）
*
* @return {Function}     返回一个“去弹跳”了的函数
*/
export declare function debounce(fn: any, delay: any): () => void;
export declare function get(o: any, path: any, defaultValue?: any): any;
export declare function set(target: {}, path: any, value: any): {};
