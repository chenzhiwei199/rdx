import { ShareContextClass, DeliverOptions } from '../RdxContext/shareContext';
import { BaseContext, Status, IRdxTask, IRdxAnyDeps } from '../global';
import { RdxState } from '../RdxValues';

export function getId(dep: IRdxAnyDeps) {
  if (dep instanceof RdxState) {
    return dep.getId();
  } else {
    return dep;
  }
}

export function getDepIds(deps: IRdxAnyDeps[] = []) {
  return deps.map(getId);
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
    value: context.getTaskStateById(id),
    status:
      context.getTaskStatusById(id) && context.getTaskStatusById(id).value
        ? context.getTaskStatusById(id).value
        : Status.FirstRender,
    loading: [Status.Waiting, Status.Running].includes(
      context.getTaskStatusById(id)?.value
    ),
    errorMsg: (context.getTaskStatusById(id) || {}).errorMsg,
  };
}

export function createMutators(id: string, context: ShareContextClass) {
  return {
    next: (selfValue: any, options?: DeliverOptions) => {
      context.next(id, selfValue, options);
    },
    nextById: (id, selfValue, options?: DeliverOptions) => {
      context.next(id, selfValue, options);
    },
    // ? 这里应该加上scope， 刷新只刷新作用域下面的
    refresh: () => {
      context.next(id, (v) => v, { refresh: true });
    },
    loading: isLoading(context, id),
  };
}

const isLoading = (context: ShareContextClass, id: string) => {
  return (
    context.getTaskStatusById(id)?.value === Status.Waiting ||
    context.getTaskStatusById(id)?.value === Status.Running
  );
};
