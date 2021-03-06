import { RdxState, RdxNodeType } from '../base';
import { getId } from '../../utils';
import logger from '../../utils/log';
import { ShareContextClass } from '../../RdxContext/shareContext';
import { IRdxDeps, IRdxTask } from '../../global';
import {
  IRdxComputeGet,
  IRdxComputeNode,
  IRdxComputeOperate,
  IRdxComputeSet,
} from './types';
import {
  createComputeMutators,
  detectValueAndDeps,
  isNullTag,
  uniqBy,
  ComputeErrorType,
} from './utils';
import { checkValueIsSync } from '../core';
import { rdxNodeOperates } from '../rdxAtom';
import { TaskEventTriggerType, TaskEventType } from '../../DataPersist/type';

export class RdxComputeNode<GModel> extends RdxState<GModel>
  implements IRdxComputeOperate<GModel> {
  get: IRdxComputeGet<GModel>;
  set?: IRdxComputeSet<GModel>;
  virtual?: boolean = true;
  constructor(config: IRdxComputeNode<GModel>) {
    super({ type: RdxNodeType.Compute, ...config });
    const { get, set, virtual } = config;
    this.get = get;
    this.set = set;
    this.virtual = virtual;
  }
  fireGetFuncCount = 0;
  reactionCount = 0;
  /**
   * get调用标记
   */
  fireGet() {
    this.fireGetFuncCount++;
  }
  isSync(context: ShareContextClass) {
    const mutators = createComputeMutators(context, this);
    // 捕获依赖和数据
    const valueAndDeps = mutators.getCache();
    return checkValueIsSync(context, valueAndDeps.value);
  }
  getTaskInfo(context: ShareContextClass): IRdxTask<any> {
    const mutators = createComputeMutators(context, this);
    // 捕获依赖和数据
    return {
      type: RdxNodeType.Compute,
      id: this.getId(),
      deps: mutators.getCache().deps,
      fireWhenDepsUpdate: (id) => {
        // 动态依赖监测,获取每次依赖完成的时机，在这个时机需要去更新依赖内容
        logger.info(`fireWhenDepsUpdate depId-${id}, selfId-${this.getId()}`);
        // 依赖更新需要重新计算数据
        mutators.checkAndUpdateDeps();
        // 重新触发任务
        context.executeTask(
          {
            key: this.getId(),
            downStreamOnly: false,
          },
          `${
            TaskEventTriggerType.DepsUpdate
          }-currentId:${this.getId()}-depsId: ${id}` as any
        );
      },
      ...rdxNodeOperates(context, this.virtual),
      reset: (context) => {
        this.reset(context);
      },
      next: (context, id, value, options) => {
        let collectDirtys = [];
        if (this.set) {
          const collect = (atom: IRdxDeps<any>) => {
            collectDirtys.push(getId(atom));
          };
          try {
            this.set(
              {
                id: id,
                // value: mutators.get(id),
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
        context.notifyDownStreamPoints([
          { key: id, downStreamOnly: !options.refresh },
          ...uniqBy(collectDirtys, (a) => a).map((item) => ({
            key: item,
            downStreamOnly: true,
          })),
        ]);
      },
      reaction: !this.isSync(context)
        ? async (reactionContext) => {
            console.log('reactionContext: ');
            const { updateState, close } = reactionContext;
            try {
              if (!mutators.hasCache()) {
                mutators.checkAndUpdateDeps();
              }

              // 通过cache中的数据获取结果
              const value = await mutators.getCache().value;
              updateState(value);
            } catch (error) {
              // 当cache中的数据有误的时候会执行到这里
              mutators.checkAndUpdateDeps();
              try {
                // cache有误的时候，reaction中是最合适的时机，再获取一次数据
                const value = await mutators.getCache().value;
                updateState(value);
              } catch (error) {
                // 当前任务执行的时候，还有依赖没有准备好，由于是动态依赖探测，所以不一定可以在最合适的时机获取数据，
                // 这里检测的异常是依赖没准备完成导致的，则hold on当前任务，等待被依赖更新重试
                if (error.message === ComputeErrorType.DepsNotReady) {
                  close();
                } else {
                  throw error;
                }
              }
            }

            mutators.deleteCache();
          }
        : (reactionContext) => {
            const { updateState } = reactionContext;
            // 1. 缓存中不存在数据 2.缓存中数据数据无效为nullTag
            if (!mutators.hasCache() || isNullTag(mutators.getCache().value)) {
              mutators.checkAndUpdateDeps();
            }
            let value = mutators.getCache().value;
            updateState(value);
            mutators.deleteCache();
          },
    };
  }
  reset(context: ShareContextClass) {
    this.init(context, true);
  }
  init(context: ShareContextClass, force: boolean = false) {
    detectValueAndDeps(this, context, force, 'init');
    const value = createComputeMutators(context, this).getCache().value;
    const isSync = checkValueIsSync(context, value) && !isNullTag(value);
    // 初次加载，应用数据
    if (isSync) {
      // 设置初始化的值，所有依赖项都可以直接获取到，可以直接计算出结果值
      context.set(this.getId(), value);
      context.markIDeal(this.getId());
    } else {
      context.markWaiting(this.getId());
      context.executeTask(
        {
          key: this.getId(),
          downStreamOnly: false,
        },
        (TaskEventTriggerType.TriggerByTaskInit + '-' + this.getId()) as any
      );
    }
  }
  load(context: ShareContextClass) {
    context.emit(
      TaskEventType.TaskLoad,
      `${TaskEventType.TaskLoad}-${this.getId()}`
    );
    detectValueAndDeps(this, context, true);
    context.addOrUpdateTask(this.getId(), this.getTaskInfo(context));
    
    // 设置默认值
    // if(checkValueIsSync(context, this.defaultValue) && this.defaultValue &&  context.getTaskStateById(this.getId()) === undefined) {
    //   context.set(this.getId(), getSyncValue(context, this.defaultValue))
    // }
    this.init(context);
  }
}
export function compute<GModel>(
  config: IRdxComputeNode<GModel>
): RdxState<GModel> {
  const atom = new RdxComputeNode({ ...config, type: RdxNodeType.Compute });
  return atom;
}

const c = compute({ id: '1', get: () => 1 });
