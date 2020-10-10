import {
  getDepId,
  IRdxAnyDeps,
  isPromise,
  RdxNode,
  RdxWatcherNode,
  ShareContextClass,
  Status,
} from '../..';
import logger from '../../utils/log';
import { loadDefaultValue } from '../core';

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
 * @returns
 */
export function detectValueAndDeps<GModel>(
  watcher: RdxWatcherNode<GModel>,
  context: ShareContextClass,
  loggerInfo?: string
) {
  const deps: IRdxAnyDeps[] = [];
  const depsIdSets = new Set();
  const specificWatcher = watcher as RdxWatcherNode<GModel>;
  const isChange = (deps) => {
    return isDepsChange(context.getDeps(watcher.getId()), deps);
  };
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
      throw new Error(`依赖节点${id}暂未初始化完成`);
    }
  };
  try {
    logger.info('detectValueAndDeps-' + loggerInfo, watcher.getId());
    watcher.fireGet();
    let value = specificWatcher.get({
      id: watcher.getId(),
      value: context.hasTask(watcher.getId())
        ? context.getTaskStateById(watcher.getId())
        : undefined,
      get: get,
    });
    // DataModel<GModel> = GModel | Promise<GModel> | RdxNode<GModel>;
    // 返回值可能为上述的几种类型，
    // RdxNode这种情况目前还没有考虑到
    // 1. GModel的异常处理，GModel异常处理可以直接反馈出来
    // 2. Promise<GModel> 的异常处理只有在调用then的时候才会表现出来
    // if (isPromise(value)) {
    //   (value as any).catch(() => {
       
    //   });
    // }
    // 更新依赖
    context.setDeps(watcher.getId(), deps);
    // 重新触发调度
    context.markDirtyNodes({ key: watcher.getId(), includesSelf: true });
    // context.executeTask({
    //   key: watcher.getId(),
    //   downStreamOnly: false,
    // }, null);
    return { value, deps: deps.slice() };
  } catch (error) {
    context.markWaiting(watcher.getId());
    if (isChange(deps)) {
      // 更新依赖
      context.setDeps(watcher.getId(), deps);
      // 重新触发调度
      context.markDirtyNodes({ key: watcher.getId(), includesSelf: true });
      context.executeTask({
        key: watcher.getId(),
        downStreamOnly: false,
      }, null);
    }
    return { value: new NullTag(), deps: deps.slice() };
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
      const value = detectValueAndDeps(watcher, context, 'checkAndUpdateDeps');
      const deps = value.deps;
      if (isDepsChange(context.getDeps(id), deps)) {
        context.setDeps(id, deps);
      }
      context.setCache(id, value);
    },
    loadDefault: () => {
      const valueAndDeps = context.getCache(id);
      let value: { ready: boolean; data: any | null } = {
        ready: false,
        data: null,
      };
      // 设置默认值
      if (!isNullTag(valueAndDeps.value)) {
        value = loadDefaultValue<any>(context, valueAndDeps.value as any);
      }
      return value;
    },
  };
};
