import {
  createMutators,
  DataModel,
  getId,
  IRdxAnyDeps,
  IRdxDeps,
  isPromise,
  RdxState,
  RdxComputeNode,
  ShareContextClass,
  Status,
} from '../..';
import logger from '../../utils/log';
import { TaskEventType } from '../../DataPersist';
export enum ComputeErrorType {
  DepsNotReady = 'DepsNotReady',
}
/**
 * 检查依赖是否改变
 * @param preDeps
 * @param nextDeps
 */
export function isDepsChange(
  preDeps: IRdxAnyDeps[] = [],
  nextDeps: IRdxAnyDeps[] = []
) {
  let change = false;
  for (let index = 0; index < nextDeps.length; index++) {
    if (!preDeps[index] || preDeps[index] !== nextDeps[index]) {
      change = true;
    }
  }
  return change;
}

/**
 * 核心： 通过执行compute.get方法来收集依赖关系。
 * 通过传入 compute和 ShareContextClass， 来获取依赖关系和预计算值
 * @export
 * @param {RdxState} compute
 * @param {ShareContextClass<any, any>} context
 * @param {boolean} force 如果force 为true，则会强制检查更新，如果force为false，则会检查缓存，如果有缓存则不检查更新
 * @returns
 */
export function detectValueAndDeps<GModel>(
  compute: RdxComputeNode<GModel>,
  context: ShareContextClass,
  force: boolean = false,
  loggerInfo?: string
): void {
  const mutators = createComputeMutators(context, compute);
  if (!force && mutators.hasCache()) {
    return;
  }
  const deps: IRdxAnyDeps[] = [];
  const depsIdSets = new Set();
  const get = (atom) => {
    const id = getId(atom);
    if (!depsIdSets.has(id)) {
      deps.push(atom);
      depsIdSets.add(id);
    }

    if (!context.hasTask(id)) {
      if (atom instanceof RdxState) {
        atom.load(context);
      } else {
        throw new Error(`${compute.getId()}节点依赖的${id}未初始化。`);
      }
    }
    if (context.isTaskReady(id)) {
      return context.getTaskStateById(id);
    } else {
      // `依赖节点${id}暂未初始化完成`
      throw new Error(ComputeErrorType.DepsNotReady);
    }
  };
  try {
    logger.info('detectValueAndDeps-' + loggerInfo, compute.getId());
    compute.fireGet();
    let value = compute.get({
      id: compute.getId(),
      callbackMapWhenConflict: context.createConflictCallback(compute.getId()),
      get: get,
    });
    // DataModel<GModel> = GModel | Promise<GModel> | RdxNode<GModel>;
    // 返回值可能为上述的几种类型，
    // RdxNode这种情况目前还没有考虑到
    // 1. GModel的异常处理，GModel异常处理可以直接反馈出来
    // 2. Promise<GModel> 的异常处理只有在调用then的时候才会表现出来
    if (isPromise(value)) {
      (value as any).catch(() => {});
    }
    mutators.setCache({ value, deps });
  } catch (error) {
    mutators.setCache({ value: new NullTag(), deps });
  } finally {
    // 节点可能未初始化
    if(context.hasTask(compute.getId())) {
      if(isDepsChange( context.getTaskById(compute.getId()).deps, deps)) {
        context.emit(TaskEventType.DynamicDepsUpdate, TaskEventType.DynamicDepsUpdate + '-' + compute.getId())
        context.setDeps(compute.getId(), deps);
      }
    }
  }
}

export class NullTag {}
export function isNullTag(value) {
  return value instanceof NullTag;
}

export const createComputeMutators = (
  context: ShareContextClass,
  compute: RdxComputeNode<any>
) => {
  const id = compute.getId();
  return {
    id: id,
    set: (atom, value) => {
      // !处理数据还没有回来的情况
      context.set(getId(atom), value);
    },
    get: (atom) => {
      if (context.getTaskStatusById(getId(atom)).value !== Status.IDeal) {
        throw new Error(getId(atom) + '数据还未准备好');
      }
      return context.getTaskStateById(getId(atom));
    },
    reset: (atom) => {
      context.resetById(getId(atom));
    },
    hasCache: () => {
      return context.hasCache(id);
    },
    setCache: (value) => {
      context.setCache(id, value);
    },
    deleteCache: () => {
      context.deleteCache(id);
    },
    getCache: () => {
      return context.getCache(id);
    },
    checkAndUpdateDeps: () => {
      detectValueAndDeps(compute, context, true, 'checkAndUpdateDeps');
      // const mutators = createComputeMutators(context, compute);
      // const value = mutators.getCache();
      // context.setCache(id, value);
    },
  };
};

export function uniqBy<T>(arr: T[], getValue: (pre: T) => any) {
  let newArr = [] as T[];
  const set = new Set();
  arr.forEach((arrItem) => {
    const v = getValue(arrItem);
    if (!set.has(v)) {
      set.add(v);
      newArr.push(arrItem);
    }
  });
  return newArr;
}
