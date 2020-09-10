import { ShareContextClass, DeliverOptions } from '../RdxContext/shareContext';
import {
  BaseContext,
  IGraphDeps,
  RENDER_STATUS,
  Status,
  IRdxView,
  IRdxAnyDeps,
} from '../global';
import { RdxNode } from '../RdxValues';

export function getDepId(dep: IRdxAnyDeps) {
  if(dep instanceof RdxNode) {
    return dep.getId()
  } else {
    return dep
  }
}

export function getDepIds(deps: IRdxAnyDeps[] = []) {
  return deps.map(getDepId)
}
export function createBaseContext<IModel, IRelyModel>(
  id: string,
  context: ShareContextClass<IModel, IRelyModel>,
  defaultTaskMap?: IRdxView<IModel, IRelyModel>
): BaseContext<IModel, IRelyModel> {
  let taskInfo = context.getTaskMap(id);
  taskInfo = taskInfo ? taskInfo : defaultTaskMap;
  const { deps = [] } = taskInfo;
  return {
    id,
    deps: deps,
    depsValues: ((deps || (taskInfo && taskInfo.deps) || []).map((key) => {
      const currentDeptId = getDepId(key);
      return context.taskState.get(currentDeptId);
    }) as unknown) as IRelyModel,
    state: context.taskState.getAll(),
    value: context.taskState.get(id),
    status:
      context.taskStatus.get(id) && context.taskStatus.get(id).value
        ? context.taskStatus.get(id).value
        : RENDER_STATUS.FirstRender,
    loading: [Status.Waiting, Status.Running].includes(
      context.taskStatus.get(id)?.value
    ),
    errorMsg: (context.taskStatus.get(id) || {}).errorMsg,
    lastDepsValue: deps.map((dep) => {
      const tasksMap = context.tasksMap;
      if (tasksMap.get(getDepId(dep))) {
        return context.preTaskState && context.preTaskState.get(getDepId(dep));
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
    refreshView: () => {
      context.notifyModule(id);
    },
    nextById: (id, selfValue, options?: DeliverOptions) => {
      context.next(id, selfValue, options);
    },
    // ? 这里应该加上scope， 刷新只刷新作用域下面的
    refresh: () => {
      context.next(id, (v) => v, { refresh: true});
    },
    loading: isLoading(context, id),
    // TODO: 其他组件中的默认值， 怎么获取
    // mergeScopeState2Global: () => {
    //   context.mergeScopeState2Global(id);
    // },
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
