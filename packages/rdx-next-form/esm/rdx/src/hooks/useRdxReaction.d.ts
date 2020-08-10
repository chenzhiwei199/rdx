import { TaskStatus } from '../RdxContext/shareContext';
import { IRdxReactionProps, IRdxState } from '../global';
export declare function useRdxReaction<IModel, IRelyModel>(
  props: IRdxReactionProps<IModel, IRelyModel>
): [TaskStatus];
export declare type ISetState<IModel> = IModel | ((state: IModel) => IModel);
export declare function useRdxState<IModel, IAction>(
  props: IRdxState<IModel, IAction>
): [IModel, (state: ISetState<IModel>) => void, (action: IAction) => void];
