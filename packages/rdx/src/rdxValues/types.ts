import { RdxNode } from '.';

export type DataModel<GModel> = GModel | Promise<GModel> | RdxNode<GModel>;
