import {
  useRdxState,
  useRdxContextAutoId,
  useRdxContext,
} from '../hooks/useRdxReaction';
import allAtoms, {
  IRdxAtomConfig,
  RdxNode,
  useRdxAtomValue,
  registNode,
  RdxNodeType,
} from './rdxAtom';
import { ReactionType, IDeps } from '@czwcode/task-queue';
import { isPromise } from '../utils';

export interface IRdxSelectorOperate<IModel> {
  get: (config: {
    get: any;
  }) => IModel | Promise<IModel> | RdxNode<IRdxSelectorConfig<IModel>>;
  set?: (config: { get: any; set: any; reset: any }, newValue: IModel) => void;
}
export type IRdxSelectorConfig<IModel> = IRdxAtomConfig<IModel> &
  IRdxSelectorOperate<IModel>;

export function useRdxSelector<IModel>(
  selector: RdxNode<IRdxSelectorConfig<IModel>>
) {
  // 自成一个节点
  // 依赖别的节点
  // 注册节点
  // 更新依赖关系
  // 原来的依赖关系

  // 执行一次才知道依赖关系
  function detectValueAndDeps() {
    const deps: IDeps[] = [];
    const depsIdSets = new Set();
    let value = selector.operator.get({
      get: (atom: RdxNode<any>) => {
        const id = atom.getId();
        if (!depsIdSets.has(id)) {
          deps.push({ id: id });
          depsIdSets.add(id);
        }

        return atom.value;
      },
    });
    // 返回记录的依赖关系
    return { value, deps };
  }

  // function checkDepsAllFinish(deps: IDeps[]){
  //   return deps.every((dep) => {
  //     // 检查依赖节点是否结束了， 结束了可以返回最新的值，否则不返回
  //     return allAtoms.get(dep.id).isFinish()
  //   })
  // }
  const { value, deps } = detectValueAndDeps();

  function isDifferent(preDeps: IDeps[], nextDeps: IDeps[]) {
    let change = false
    for(let index = 0; index < preDeps.length; index++) {
      if(preDeps[index].id !== nextDeps[index].id) {
        change = true
      }
    }
    return change
  }
  // !更新完依赖内容后，需要重新执行调度，但是要保证原来已经在执行中，且依赖参数没有改变的执行继续下去，不能再次生成
  const context = useRdxContextAutoId({
    deps: deps,
    beforeReaction: () => {
      selector.setLoading()
    },
    onSingleTaskComplete: (id, context) => {
      // 动态依赖监测,获取每次依赖完成的时机，在这个时机需要去更新依赖内容
      if(selector.getDeps().some(item => item.id)) {
        const {deps} = detectValueAndDeps()
        const isChange = isDifferent(selector.getDeps(), deps)
        if(isChange) {
          selector.setDeps(deps)
          // 触发刷新
          context.triggerSchedule(id)
        }
        // 检查deps变化
      }
    },
    afterReaction: () => {
      selector.setLoading()
    },
    reaction: async (context) => {
      const { updateState } = context;
      const value = detectValueAndDeps().value;
      if (isPromise(value)) {
        updateState(await (value as Promise<IModel>));
      } else {
        updateState(value);
      }
    },
  });
  return [
    context.value,
    (v) => {
      // 触发所有依赖项更新
      context.nextById(selector.getId(), v);
    },
  ];
}
export function selector<IModel>(config: IRdxSelectorConfig<IModel>) {
  const { id, get, set } = config;
  const atom = new RdxNode({ id }, RdxNodeType.Selector ,{ get, set });
  registNode(config.id, atom);
  return atom;
}
