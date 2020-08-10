import { ShareContextClass } from '../RdxContext/shareContext';
import { BaseModuleProps } from '../RdxView/View';
import { BaseContext } from '../global';
export declare function checkIsChange<IModel, IRelyModel>(
  context: ShareContextClass<IModel, IRelyModel>,
  oldContext: ShareContextClass<IModel, IRelyModel>,
  taskKey: string
): boolean;
export interface CheckTaskInterface {
  task: any;
  relyTaskKeys?: string[];
  taskKey: string;
  scope?: string;
}
export declare enum CompareType {
  ExecuteTask = 'ExecuteTask',
  ViewShouldUpdate = 'ViewShouldUpdate',
}
export declare function checkTaskChange(
  preProps: any,
  nextProps: any,
  type: CompareType
): boolean;
export declare function checkIsModuleChange(
  preProps: any,
  nextProps: any,
  type: CompareType
): boolean;
export declare function createBaseContext<IModel, IRelyModel>(
  id: string,
  context: ShareContextClass<IModel, IRelyModel>,
  defaultTaskMap?: BaseModuleProps<IModel, IRelyModel, IModuleConfig, any>
): BaseContext<IModel, IRelyModel>;
