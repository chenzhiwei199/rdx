import { IRdxTaskBase } from '../global';
export declare type IRdxStateHook<GModel> = IRdxTaskBase<GModel> & {
    id: string;
};
export declare function useDefaultValue<IModel, IRelyModel>(): void;
