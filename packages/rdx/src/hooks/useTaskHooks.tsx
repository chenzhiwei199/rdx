import { IRdxTaskBase } from '../global';

export type IRdxStateHook<GModel> = IRdxTaskBase<GModel> & { id: string };

export function useDefaultValue<IModel, IRelyModel>() {}
