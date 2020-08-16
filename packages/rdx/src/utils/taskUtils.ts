import { ShareContextClass, DeliverOptions } from '../RdxContext/shareContext';
import shallowEqual from 'shallowequal';
import {
  BaseContext,
  IGraphDeps,
  RENDER_STATUS,
  Status,
  IRdxView,
} from '../global';

export function checkTaskChange(preProps: any, nextProps: any) {
  if (!nextProps || !preProps) {
    return true;
  }
  let change = false;
  Object.keys(preProps).forEach((key) => {
    // 如果引用相等
    if ((preProps[key], nextProps[key])) {
      change = false;
    } else {
      // 数据比较
      if (Array.isArray(nextProps[key])) {
        change = nextProps[key].some((item, index) => {
          return !shallowEqual(item, nextProps[key][index]);
        });
      } else if (!shallowEqual(preProps[key], nextProps[key])) {
        // 其他的比较
        change = true;
      }
    }
  });
  return change;
}

export function createBaseContext<IModel, IRelyModel>(
  id: string,
  context: ShareContextClass<IModel, IRelyModel>,
  defaultTaskMap?: IRdxView<IModel, IRelyModel, any>
): BaseContext<IModel, IRelyModel> {
  let taskInfo = context.getTaskMap(id);
  taskInfo = taskInfo ? taskInfo : defaultTaskMap;
  const { deps = [], scope } = taskInfo;
  return {
    id,
    deps: deps,
    depsValues: ((deps || (taskInfo && taskInfo.deps) || []).map((key) => {
      const currentDeptId = key.id;
      const scope =
        context.tasksMap.get(currentDeptId) &&
        context.tasksMap.get(currentDeptId).scope;
      return context.taskState.get(currentDeptId, scope);
    }) as unknown) as IRelyModel,
    state: context.taskState.getAll(),
    value: context.taskState.get(id, scope),
    status:
      context.taskStatus.get(id) && context.taskStatus.get(id).value
        ? context.taskStatus.get(id).value
        : RENDER_STATUS.FirstRender,
    loading: [Status.Waiting, Status.Running].includes(
      context.taskStatus.get(id)?.value
    ),
    errorMsg: (context.taskStatus.get(id) || {}).errorMsg,
    lastDepsValue: deps.map((dep: IGraphDeps) => {
      const tasksMap = context.tasksMap;
      if (tasksMap.get(dep.id)) {
        const scope = tasksMap.get(dep.id).scope;
        return context.preTaskState && context.preTaskState.get(dep.id, scope);
      } else {
        return null;
      }
    }) as any,
  };
}

export function createMutators<IModel, IRelyModel>(
  id: string,
  context: ShareContextClass<IModel, IRelyModel>
) {
  return {
    next: (selfValue: IModel, options?: DeliverOptions) => {
      context.next(id, selfValue, options);
    },
    dispatchById: (id: string, action, options) => {
      context.dispatchAction(id, action, options);
    },
    dispatch: (action, options) => {
      context.dispatchAction(id, action, options);
    },
    refreshView: () => {
      context.notifyModule(id);
    },
    nextById: (id, selfValue, options?: DeliverOptions) => {
      context.next(id, selfValue, options);
    },
    // ? 这里应该加上scope， 刷新只刷新作用域下面的
    refresh: context.refresh.bind(null, id),
    loading: isLoading(context, id),
    // TODO: 其他组件中的默认值， 怎么获取
    mergeScopeState2Global: () => {
      context.mergeScopeState2Global(id);
    },
  };
}

const isLoading = <IModel, IRelyModel>(
  context: ShareContextClass<IModel, IRelyModel>,
  id: string
) => {
  return (
    context.taskStatus.get(id)?.value === Status.Waiting ||
    context.taskStatus.get(id)?.value === Status.Running
  );
};

