import { ShareContextClass } from '../RdxContext/shareContext';
import { useRef, useEffect } from 'react';
import shallowequal from 'shallowequal';
import shallowEqual from 'shallowequal';
import { BaseModuleProps } from '../RdxView/View';
import { BaseContext, IGraphDeps } from '../global';

export function checkIsChange<IModel, IRelyModel, IModuleConfig>(
  context: ShareContextClass<IModel, IRelyModel, IModuleConfig>,
  oldContext: ShareContextClass<IModel, IRelyModel, IModuleConfig>,
  taskKey: string
) {
  const scope = context.tasksMap.get(taskKey).scope;
  const preScope =
    oldContext.tasksMap.get(taskKey) && oldContext.tasksMap.get(taskKey).scope;
  return (
    context.taskStatus.get(taskKey) !== oldContext.taskStatus.get(taskKey) ||
    context.taskState.get(taskKey, scope) !==
      oldContext.taskState.get(taskKey, preScope)
  );
}


export interface CheckTaskInterface {
  task: any;
  relyTaskKeys?: string[];
  taskKey: string;
  scope?: string;
}
export enum CompareType {
  ExecuteTask = 'ExecuteTask',
  ViewShouldUpdate = 'ViewShouldUpdate',
}
export function checkTaskChange(
  preProps: any,
  nextProps: any,
  type: CompareType
) {
  if (!nextProps || !preProps) {
    return true;
  }
  let change = false;
  const notCareKeys = ['defaultValue', 'moduleConfig', 'areEqualForTask'];
  Object.keys(preProps).forEach((key) => {
    if (key === 'deps') {
      change = nextProps[key].some((item, index) => {
        return !shallowEqual(item, preProps[key][index]);
      });
    } else if (notCareKeys.includes(key)) {
      if (checkIsModuleChange(preProps, nextProps, type)) {
        change = true;
      }
    } else {
      if (!shallowequal(preProps[key], nextProps[key])) {
        change = true;
      }
    }
  });
  return change;
}
export function checkIsModuleChange(
  preProps: any,
  nextProps: any,
  type: CompareType
) {
  const { areEqualForTask, moduleConfig } = nextProps;
  const preModuleConfig = preProps && preProps.moduleConfig;
  const isModelConfigChange = areEqualForTask
    ? !areEqualForTask(type, moduleConfig, preModuleConfig)
    : !shallowEqual(moduleConfig, preModuleConfig);
  // console.log('isModelConfigChange: ', isModelConfigChange);
  return isModelConfigChange;
}



export function createBaseContext<IModel, IRelyModel, IModuleConfig>(
  id: string,
  context: ShareContextClass<IModel, IRelyModel, IModuleConfig>,
  defaultTaskMap?: BaseModuleProps<IModel, IRelyModel, IModuleConfig, any>
): BaseContext<IModel, IRelyModel, IModuleConfig> {
  let taskInfo = context.tasksMap.get(id);
  taskInfo = taskInfo ? taskInfo: defaultTaskMap
  const { moduleConfig, deps = [], scope } =  taskInfo;
  return {
    id,
    deps: deps,
    moduleConfig,
    depsModuleConfig: deps.map((dep) => {
      const taskMap = context.tasksMap;
      return taskMap.get(dep.id) && taskMap.get(dep.id).moduleConfig;
    }),
    depsValues: ((deps || (taskInfo && taskInfo.deps) || []).map((key) => {
      const currentDeptId = key.id;
      const scope =
        context.tasksMap.get(currentDeptId) &&
        context.tasksMap.get(currentDeptId).scope;
      return context.taskState.get(currentDeptId, scope);
    }) as unknown) as IRelyModel,
    state: context.taskState.getAll(),
    value: context.taskState.get(id, scope),
    lastDepsValue: deps.map((dep: IGraphDeps) => {
      const tasksMap = context.tasksMap;
      if (tasksMap.get(dep.id)) {
        const scope = tasksMap.get(dep.id).scope;
        return (
          context.preTaskState && context.preTaskState.get(dep.id, scope)
        );
      } else {
        return null;
      }
    }) as any,
  };
}