import {
  RdxNode,
  registNode,
  RdxNodeType,
  IRdxNode,
  RdxGet,
  RdxSet,
  RdxReset,
} from './base';
import { isPromise, getDepId } from '../utils';
import logger from '../utils/log';
import {
  ShareContextClass,
  ShareContextInstance,
} from '../RdxContext/shareContext';
import {
  IRdxView,
  StateUpdateType,
  IRdxAnyDeps,
  Status,
  IRdxDeps,
} from '../global';
import { loadDefualtValue } from './core';
import { DataModel } from './types';

export function isDifferent(
  preDeps: IRdxAnyDeps[] = [],
  nextDeps: IRdxAnyDeps[] = []
) {
  let change = false;
  for (let index = 0; index < nextDeps.length; index++) {
    if (!preDeps[index]) {
      change = true;
    } else if (preDeps[index] !== nextDeps[index]) {
      change = true;
    }
  }
  return change;
}

/**
 *
 *
 * @export
 * @interface IRdxWatcherOperate
 * @template IModel
 */
export interface IRdxWatcherOperate<IModel> {
  get: (config: { get: RdxGet }) => IModel | RdxNode<IModel> | Promise<IModel>;
  set?: (
    config: {
      get: RdxGet;
      set: RdxSet;
      reset: RdxReset;
    },
    newValue: IModel
  ) => void;
}
export type IRdxWatcherNode<IModel> = IRdxNode & IRdxWatcherOperate<IModel>;

export class RdxWatcherNode<IModel> extends RdxNode<IModel>
  implements IRdxWatcherOperate<IModel> {
  load(context: ShareContextClass<any, any>): IRdxView<any, any> {
    const valueAndDeps = detectValueAndDeps(this, context);
    loadDefualtValue(this.getId(), context, valueAndDeps.value);
    context.setCache(this.getId(), valueAndDeps);

    const isChange = (deps) => {
      return isDifferent(context.getDeps(this.getId()), deps);
    };

    const checkAndUpdateDeps = (deps) => {
      if (isChange(deps)) {
        context.setDeps(this.getId(), deps);
        // 触发刷新
        context.triggerSchedule(this.getId());
      }
    };
    return {
      id: this.getId(),
      deps: valueAndDeps.deps,
      fireWhenDepsUpdate: (id) => {
        // 动态依赖监测,获取每次依赖完成的时机，在这个时机需要去更新依赖内容
        logger.info(
          'fireWhenDepsUpdate',
          `depId-${id}, selfId-${this.getId()}`
        );
        const value = detectValueAndDeps(this, context);
        checkAndUpdateDeps(value.deps);
        context.setCache(this.getId(), value);
        // 检查deps变化
      },
      next: (context, id, value) => {
        let collectDirtys = [id];
        if (this.set) {
          function collect(atom: IRdxDeps<any>) {
            collectDirtys.push(getDepId(atom));
          }
          //  更新状态
          try {
            this.set(
              {
                set: (atom, value) => {
                  // !处理数据还没有回来的情况
                  context.set(getDepId(atom), value);
                  collect(atom);
                },
                get: (atom) => {
                  if (
                    context.getTaskStatus(getDepId(atom)).value !== Status.IDeal
                  ) {
                    throw new Error(getDepId(atom) + '数据还未准备好');
                  }
                  return context.getTaskState(getDepId(atom));
                },
                reset: (atom) => {
                  context.reset(getDepId(atom));
                  collect(atom);
                },
              },
              value
            );
          } catch (error) {
            logger.warn(error);
          }
        }
        context.markDirtyNodes(collectDirtys);
        for (let dirty of collectDirtys) {
          //  通知组件状态更新, 直接修改的相关数据，立即更新
          context.notifyModule(dirty, true, StateUpdateType.State);
          // 所有的改变元素，都要触发下游任务
          context.triggerSchedule(dirty, { refresh: false, manual: true });
        }
      },
      reaction: async (reactionContext) => {
        const { updateState } = reactionContext;
        let valueAndDeps = context.getCache(this.getId());
        const { value, deps } = valueAndDeps;
        // if (valueAndDeps === null) {
        //   valueAndDeps = detectValueAndDeps(this, context);
        // }
        // if (isChange(deps)) {
        //   checkAndUpdateDeps(deps);
        // }
        if (isPromise(value)) {
          const currentValue = await (value as Promise<any>);
          logger.info('reaction', this.getId(), currentValue);
          updateState(currentValue);
        } else {
          updateState(value);
          logger.info('reaction', this.getId(), value);
          context.setCache(this.getId(), null);
        }
      },
    };
  }
  get: (config: { get: RdxGet }) => DataModel<IModel>;
  set?: (
    config: {
      get: RdxGet;
      set: RdxSet;
      reset: RdxReset;
    },
    newValue: IModel
  ) => void;

  constructor(config: IRdxWatcherNode<IModel>) {
    const { get, set } = config;
    super({ type: RdxNodeType.Watcher, ...config });
    this.get = get;
    this.set = set;
  }
}
export function watcher<IModel>(
  config: IRdxWatcherNode<IModel>
): RdxNode<IModel> {
  const atom = new RdxWatcherNode({ ...config, type: RdxNodeType.Watcher });
  registNode(config.id, atom);
  return atom;
}

/**
 * 核心： 通过执行watcher.get方法来收集依赖关系。
 * 通过传入 watcher和 ShareContextClass， 来获取依赖关系和预计算值
 * @export
 * @param {RdxNode} watcher
 * @param {ShareContextClass<any, any>} context
 * @returns
 */
export function detectValueAndDeps(
  watcher: RdxWatcherNode<any>,
  context: ShareContextClass<any, any>
) {
  const deps: IRdxAnyDeps[] = [];
  const depsIdSets = new Set();
  const specificWatcher = watcher as RdxWatcherNode<any>;
  let value = specificWatcher.get({
    get: (atom) => {
      const id = getDepId(atom);
      if (!depsIdSets.has(id)) {
        deps.push(atom);
        depsIdSets.add(id);
      }
      return context.getTaskState(id);
    },
  });
  // 返回记录的依赖关系
  return { value, deps };
}
