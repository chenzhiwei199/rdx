/// <reference types="react" />
import { RdxContextProps } from './interface';
export * from './core';
export declare const RdxContext: <
  IModel extends Object,
  IRelyModel,
  IModuleConfig extends Object
>(
  props: RdxContextProps<IModel, IRelyModel>
) => JSX.Element;
