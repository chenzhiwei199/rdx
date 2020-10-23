import { IRdxBaseState, RdxGet, RdxReset, RdxSet } from '../base';
import { DataModel } from '../types';

/**
 * @export
 * @interface IRdxComputeOperate
 * @template IModel
 */
export interface IRdxComputeOperate<GModel> {
  get: IRdxComputeGet<GModel>;
  set?: IRdxComputeSet<GModel>;
}
export type IRdxComputeNode<GModel> = IRdxBaseState &
  IRdxComputeOperate<GModel> & {
    virtual?: boolean;
  };
export interface IRdxComputeGetParams {
  id: string;
  /**
   * 当事件冲突时触发时候的回调
   *
   * @memberof ReactionContext
   */
  callbackMapWhenConflict: (callback: () => void) => void;
  get: RdxGet;
}

export type IRdxComputeGet<GModel> = (
  config: IRdxComputeGetParams
) => DataModel<GModel>;

export type IRdxComputeSet<GModel> = (
  config: {
    id: string;
    get: RdxGet;
    set: RdxSet;
    reset: RdxReset;
  },
  newValue: GModel
) => void;
