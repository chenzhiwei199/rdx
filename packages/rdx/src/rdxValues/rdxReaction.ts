import {
  RdxNode,
  registNode,
  RdxNodeType,
  IRdxNode,
  RdxGet,
  RdxSet,
  RdxReset,
  StoreValues,
} from './base';
import { isPromise, getDepId } from '../utils';
import logger from '../utils/log';
import { ShareContextClass } from '../RdxContext/shareContext';
import { IRdxView, StateUpdateType, IRdxAnyDeps, IRdxDeps } from '../global';

/**
 *
 *
 * @export
 * @interface IRdxReactionOperate
 * @template IModel
 */
export interface IRdxReactionOperate<IModel> {
  deps: IRdxAnyDeps[];
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
export type IRdxReactionNode<IModel> = IRdxNode & IRdxReactionOperate<IModel>;

export class RdxReactionNode<IModel> extends RdxNode<IModel>
  implements IRdxReactionOperate<IModel> {
  isNotifyTask(get: () => StoreValues<any>): boolean {
    throw new Error('Method not implemented.');
  }
  load(context: ShareContextClass<any, any>): IRdxView<any, any> {
    const currentReaction = this as RdxReactionNode<any>;
    return {
      id: currentReaction.getId(),
      deps: currentReaction.deps,
      next: (context, id, value) => {
        let collectDirtys = [id];
        if (currentReaction.set) {
          function collect(atom: IRdxDeps<any>) {
            collectDirtys.push(getDepId(atom));
          }
          //  更新状态
          currentReaction.set(
            {
              set: (atom, value) => {
                context.set(getDepId(atom), value);
                collect(atom);
              },
              get: (atom) => {
                return context.getTaskState(getDepId(atom));
              },
              reset: (atom) => {
                context.reset(atom.getId());
                collect(atom);
              },
            },
            value
          );
        }
        // 用户主动调用， 记录脏节点
        context.markDirtyNodes(collectDirtys);
        //  通知组件状态更新
        collectDirtys.forEach((id) => {
          context.notifyModule(id, true, StateUpdateType.State);
          context.triggerSchedule(id, { refresh: false });
        });
      },
      reaction: async (reactionContext) => {
        const { updateState } = reactionContext;
        const value = currentReaction.get({
          get: (atom) => {
            const id = getDepId(atom);
            return context.getTaskState(id);
          },
        });
        if (isPromise(value)) {
          const currentValue = await (value as Promise<any>);
          logger.info('reaction', currentReaction.getId(), currentValue);
          updateState(currentValue);
        } else {
          updateState(value);
          logger.info('reaction', currentReaction.getId(), value);
        }
      },
    };
  }
  deps: IRdxAnyDeps[];
  rerunWhenDepsChange?: boolean;
  get: (config: { get: RdxGet }) => IModel | RdxNode<IModel> | Promise<IModel>;
  set?: (
    config: {
      get: RdxGet;
      set: RdxSet;
      reset: RdxReset;
    },
    newValue: IModel
  ) => void;

  constructor(config: IRdxReactionNode<IModel>) {
    const { get, set, deps } = config;
    super({ type: RdxNodeType.Reaction, ...config });
    this.get = get;
    this.set = set;
    this.deps = deps;
  }
}
export function reaction<IModel>(
  config: IRdxReactionNode<IModel>
): RdxNode<IModel> {
  const atom = new RdxReactionNode({ ...config, type: RdxNodeType.Reaction });
  registNode(config.id, atom);
  return atom;
}
