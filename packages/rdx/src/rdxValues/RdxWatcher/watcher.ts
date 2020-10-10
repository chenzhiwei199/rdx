import { RdxNode, RdxNodeType } from '../base';
import { isPromise, getDepId } from '../../utils';
import logger from '../../utils/log';
import { ShareContextClass } from '../../RdxContext/shareContext';
import { IRdxDeps } from '../../global';
import {
  IRdxWatcherGet,
  IRdxWatcherNode,
  IRdxWatcherOperate,
  IRdxWatcherSet,
} from './types';
import { createWatcherMutators, detectValueAndDeps, isNullTag } from './utils';

export class RdxWatcherNode<GModel> extends RdxNode<GModel>
  implements IRdxWatcherOperate<GModel> {
  constructor(config: IRdxWatcherNode<GModel>) {
    super({ type: RdxNodeType.Watcher, ...config });
    const { get, set } = config;
    this.get = get;
    this.set = set;
  }
  fireGetFuncCount = 0;
  /**
   * get调用标记
   */
  fireGet() {
    this.fireGetFuncCount++;
  }
  load(context: ShareContextClass) {
    const mutators = createWatcherMutators(context, this);
    // 捕获依赖和数据
    const valueAndDeps = detectValueAndDeps(this, context, 'init');
    mutators.setCache(valueAndDeps);
    const value = mutators.loadDefault();
    const isAsyncValue = isPromise(valueAndDeps.value)
    // 检测数据是否有效，无效则需要重新检测依赖
    function dataCheck() {
      if (
        !mutators.hasCache() ||
        isNullTag(mutators.getCache().value)
      ) {
        mutators.checkAndUpdateDeps();
      }
    }
    context.addOrUpdateTask(
      this.getId(),
      {
        type: RdxNodeType.Watcher,
        id: this.getId(),
        deps: valueAndDeps.deps,
        fireWhenDepsUpdate: (id) => {
          // 动态依赖监测,获取每次依赖完成的时机，在这个时机需要去更新依赖内容
          logger.info(`fireWhenDepsUpdate depId-${id}, selfId-${this.getId()}`);
          // 依赖更新需要重新计算数据
          mutators.checkAndUpdateDeps();
        },
        getValue: (id) => {
          return context.getVirtualTaskState(id);
        },
        setValue: (id, value) => {
          return context.setVirtualTaskState(id, value);
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
                  id: id,
                  value: mutators.get(id),
                  set: (atom, value) => {
                    // !处理数据还没有回来的情况
                    mutators.set(atom, value);
                    collect(atom);
                  },
                  get: mutators.get,
                  reset: (atom) => {
                    mutators.reset(atom);
                    collect(atom);
                  },
                },
                value
              );
            } catch (error) {
              throw new Error(id + '节点数据设置错误' + error);
            }
          }
          context.notifyDownStreamPoints(
            collectDirtys.map((item) => ({ key: item, downStreamOnly: true }))
          );
        },
        reaction: isAsyncValue
          ? async (reactionContext) => {
              const { updateState } = reactionContext;
              // 有效数据检测
              dataCheck()
              let value;
              // 根据不同的数据的数据结构，探测结果
              try {
                // 当依赖项没有准备好的时候的cache值，不可以相信
                value = await (mutators.getCache().value as Promise<any>);
              } catch (error) {
                mutators.checkAndUpdateDeps();
                value = await mutators.getCache().value;
              }
              logger.info('reaction Async', this.getId(), value);
              updateState(value);
              mutators.deleteCache();
            }
          : (reactionContext) => {
              const { updateState } = reactionContext;
              // 有效数据检测
              dataCheck()
              let value = mutators.getCache().value;
              logger.info('reaction Sync', this.getId(), value);
              updateState(value);
              mutators.deleteCache();
            },
      },
      !value.ready
    );
    
    // 初次加载，应用数据
    if (value.ready) {
      // ! 搞清楚这里原来有this.set的目的
      context.set(this.getId(), value.data);
      context.markIDeal(this.getId());
    } else {
      context.markWaiting(this.getId());
    }
  }
  get: IRdxWatcherGet<GModel>;
  set?: IRdxWatcherSet<GModel>;
}
export function watcher<GModel>(
  config: IRdxWatcherNode<GModel>
): RdxNode<GModel> {
  const atom = new RdxWatcherNode({ ...config, type: RdxNodeType.Watcher });
  return atom;
}
