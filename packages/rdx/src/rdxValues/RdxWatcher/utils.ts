import {
  createMutators,
  DataModel,
  getDepId,
  IRdxAnyDeps,
  IRdxDeps,
  isPromise,
  RdxNode,
  RdxWatcherNode,
  ShareContextClass,
  Status,
} from '../..';
import logger from '../../utils/log';
export enum WatcherErrorType {
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
 * 核心： 通过执行watcher.get方法来收集依赖关系。
 * 通过传入 watcher和 ShareContextClass， 来获取依赖关系和预计算值
 * @export
 * @param {RdxNode} watcher
 * @param {ShareContextClass<any, any>} context
 * @param {boolean} force 如果force 为true，则会强制检查更新，如果force为false，则会检查缓存，如果有缓存则不检查更新
 * @returns
 */
export function detectValueAndDeps<GModel>(
  watcher: RdxWatcherNode<GModel>,
  context: ShareContextClass,
  force: boolean = false,
  loggerInfo?: string
): void {
  const mutators = createWatcherMutators(context, watcher);
  if(!force && mutators.hasCache()) {
    return;
  }
  const deps: IRdxAnyDeps[] = [];
  const depsIdSets = new Set();
  const get = (atom) => {
    const id = getDepId(atom);
    if (!depsIdSets.has(id)) {
      deps.push(atom);
      depsIdSets.add(id);
    }

    if (!context.hasTask(id)) {
      if (atom instanceof RdxNode) {
        atom.load(context);
      } else {
        throw new Error(`${watcher.getId()}节点依赖的${id}未初始化。`);
      }
    }
    if (context.isTaskReady(id)) {
      return context.getTaskStateById(id);
    } else {
      // `依赖节点${id}暂未初始化完成`
      throw new Error(WatcherErrorType.DepsNotReady);
    }
  };
  try {
    logger.info('detectValueAndDeps-' + loggerInfo, watcher.getId());
    watcher.fireGet();
    let value = watcher.get({
      id: watcher.getId(),
      value: context.hasTask(watcher.getId()) && context.isTaskReady(watcher.getId())
        ? context.getTaskStateById(watcher.getId())
        : watcher.defaultValue,
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
    context.setDeps(watcher.getId(), deps);
  }
}

export class NullTag {}
export function isNullTag(value) {
  return value instanceof NullTag;
}

export const createWatcherMutators = (
  context: ShareContextClass,
  watcher: RdxWatcherNode<any>
) => {
  const id = watcher.getId();
  return {
    id: id,
    set: (atom, value) => {
      // !处理数据还没有回来的情况
      context.set(getDepId(atom), value);
    },
    get: (atom) => {
      if (context.getTaskStatus(getDepId(atom)).value !== Status.IDeal) {
        throw new Error(getDepId(atom) + '数据还未准备好');
      }
      return context.getTaskStateById(getDepId(atom));
    },
    reset: (atom) => {
      context.resetById(getDepId(atom));
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
      detectValueAndDeps(watcher, context, true,  'checkAndUpdateDeps');
      const mutators = createWatcherMutators(context, watcher);
      const value = mutators.getCache();
      context.setCache(id, value);
    },
  };
};


export function uniqBy<T>(arr: T[], getValue: (pre:T) => any) {
  let newArr = [] as T[]
  const set = new Set()
  arr.forEach((arrItem) => {
    const v = getValue(arrItem)
    if(!set.has(v)) {
      set.add(v)
      newArr.push(arrItem)
    }
  })
  return newArr
}