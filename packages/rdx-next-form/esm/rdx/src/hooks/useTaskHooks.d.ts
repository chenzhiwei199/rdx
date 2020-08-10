/// <reference types="react" />
import { BaseModuleProps } from '../RdxView/View';
import { ShareContextClass } from '../RdxContext/shareContext';
import { StateUpdateType } from '../global';
export declare function useTaskInit<IModel, IRelyModel, IAction>(
  props: BaseModuleProps<IModel, IRelyModel, IAction>
): void;
export declare function useMount(): import('react').MutableRefObject<boolean>;
export declare function useTaskUpdate<IModel, IRelyModel, IAction>(
  nextProps: BaseModuleProps<IModel, IRelyModel, IAction>
): void;
export declare const ForceRender = 'ForceRender';
export declare function useStateUpdate<IModel, IRelyModel>(
  id: string,
  context: ShareContextClass<IModel, IRelyModel>,
  type: StateUpdateType
): void;
