import { ShareContextClass } from '../RdxContext/shareContext';
import { DataModel } from './types';
/**
 *
 * 判断当前的value是否是同步的值
 * @export
 * @template GModel
 * @param {ShareContextClass} context
 * @param {DataModel<GModel>} value
 * @returns
 */
export declare function checkValueIsSync<GModel>(context: ShareContextClass, value: DataModel<GModel>): boolean;
export declare function getSyncValue<GModel>(context: ShareContextClass, value: DataModel<GModel>): any;
