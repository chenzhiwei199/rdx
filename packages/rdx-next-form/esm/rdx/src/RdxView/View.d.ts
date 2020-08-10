/// <reference types="react" />
import { IBase } from '../global';
import { ShareContextClass } from '../RdxContext/shareContext';
export declare type BaseModuleProps<IModel, IRelyModel, IAction> = IBase<
  IModel,
  IRelyModel,
  IAction
> & {
  context: ShareContextClass<IModel, IRelyModel>;
};
declare const _default: <IModel, IRelyModel, IAction>(
  props: IBase<IModel, IRelyModel, IAction>
) => JSX.Element;
export default _default;
export declare const useForceUpdate: () => () => void;
