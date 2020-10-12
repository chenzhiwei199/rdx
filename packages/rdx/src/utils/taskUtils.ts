import { ShareContextClass, DeliverOptions } from '../RdxContext/shareContext';
import { BaseContext, Status, IRdxTask, IRdxAnyDeps } from '../global';
import { RdxNode } from '../RdxValues';

export function getDepId(dep: IRdxAnyDeps) {
  if (dep instanceof RdxNode) {
    return dep.getId();
  } else {
    return dep;
  }
}

export function getDepIds(deps: IRdxAnyDeps[] = []) {
  return deps.map(getDepId);
}
export function createBaseContext<GModel>(
  id: string,
  context: ShareContextClass,
  defaultTaskMap?: IRdxTask<GModel>
): BaseContext<GModel> {
  let taskInfo = context.getTaskById(id);
  taskInfo = taskInfo ? taskInfo : defaultTaskMap;
  return {
    id,
    state: context.getAllTaskState(),
    value: context.getTaskStateById(id),
    status:
      context.getTaskStatus(id) && context.getTaskStatus(id).value
        ? context.getTaskStatus(id).value
        : Status.FirstRender,
    loading: [Status.Waiting, Status.Running].includes(
      context.getTaskStatus(id)?.value
    ),
    errorMsg: (context.getTaskStatus(id) || {}).errorMsg,
    // lastDepsValue: deps.map((dep) => {
    //   const tasksMap = context.tasks;
    //   if (context.hasTask(getDepId(dep))) {
    //     return context.preTaskState && context.preTaskState.get(getDepId(dep));
    //   } else {
    //     return null;
    //   }
    // }) as any,
  };
}

export function createMutators(id: string, context: ShareContextClass) {
  return {
    next: (selfValue: any, options?: DeliverOptions) => {
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
      context.next(id, (v) => v, { refresh: true });
    },
    loading: isLoading(context, id),
    // TODO: 其他组件中的默认值， 怎么获取
    // mergeScopeState2Global: () => {
    //   context.mergeScopeState2Global(id);
    // },
  };
}

const isLoading = (context: ShareContextClass, id: string) => {
  return (
    context.getTaskStatus(id)?.value === Status.Waiting ||
    context.getTaskStatus(id)?.value === Status.Running
  );
};
