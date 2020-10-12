import { IRdxNode, RdxGet, RdxReset, RdxSet } from '../base';
import { DataModel } from '../types';

/**
 * @export
 * @interface IRdxWatcherOperate
 * @template IModel
 */
export interface IRdxWatcherOperate<GModel> {
  get: IRdxWatcherGet<GModel>;
  set?: IRdxWatcherSet<GModel>;
}
export type IRdxWatcherNode<GModel> = IRdxNode & IRdxWatcherOperate<GModel> & {
  defaultValue?: GModel,
  virtual?: boolean
};

export type IRdxWatcherGet<GModel> = (config: {
  id: string;
  value: GModel;
  get: RdxGet;
}) => DataModel<GModel>;

export type IRdxWatcherSet<GModel> = (
  config: {
    id: string;
    value: GModel;
    get: RdxGet;
    set: RdxSet;
    reset: RdxReset;
  },
  newValue: GModel
) => void;
