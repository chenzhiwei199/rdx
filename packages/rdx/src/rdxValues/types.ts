import { RdxState } from '.';

export type DataModel<GModel> = GModel | Promise<GModel> | RdxState<GModel>;
