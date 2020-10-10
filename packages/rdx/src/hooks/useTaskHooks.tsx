import { IRdxViewBase } from '../global';

export type IRdxStateHook<GModel> = IRdxViewBase<GModel> & { id: string };

export function useDefaultValue<IModel, IRelyModel>() {}
