import { Filters, IQueryConfig } from './types';
export declare function getMetas(): Promise<{
    success: boolean;
    data: any;
}>;
export declare function getDimensionTable(key: string): Promise<{
    success: boolean;
    data: any;
}>;
declare class Source {
    cancelFlag: boolean;
    token: () => boolean;
    cancel: () => void;
}
declare class _CancelToken {
    source(): Source;
}
export declare const isErrorCancel: (error: any) => boolean;
export declare const CancelToken: _CancelToken;
/**
 *
 * dimensions 单据日期,地区名称,业务员名称,客户分类,客户名称,存货名称,部门名称,存货分类,存货编码,业务员编码,订单号,客户编码,部门编码,订单明细号
 * measures "税费,不含税金额,订单金额,利润,单价,数量"
 * @export
 * @param {IQueryConfig} config
 * @returns
 */
export declare function getData(config: IQueryConfig, token?: () => boolean): Promise<{
    success: boolean;
    data: any;
}>;
export declare function getDimension(config: {
    dimensions: string;
    filters?: Filters;
}): Promise<{
    success: boolean;
    data: any;
}>;
export declare function getDimensions(): Promise<{
    success: boolean;
    data: any;
}>;
export declare function getMeasures(): Promise<{
    success: boolean;
    data: any;
}>;
export {};
