import {
  useRdxState,
  useRdxContextAutoId,
  useRdxContext,
} from '../hooks/useRdxReaction';
import { IDeps, NodeStatus } from '@czwcode/task-queue';
import { Status, IRdxView } from '../global';
import { TaskStatus } from '../RdxContext/shareContext';
import { isPromise } from '../utils';
import logger from '../utils/log';
export interface IRdxAtomConfig<IModel> {
  id: string;
  defaultValue?: IModel;
}
export enum RdxNodeType {
  Atom = 'atom',
  Selector = 'selector',
}

export function isDifferent(preDeps: IDeps[] = [], nextDeps: IDeps[] = []) {
  let change = false;
  for (let index = 0; index < preDeps.length; index++) {
    if (preDeps[index].id !== nextDeps[index].id) {
      change = true;
    }
  }
  return change;
}

export class RdxNode<T extends IRdxAtomConfig<any>> {
  type: RdxNodeType = RdxNodeType.Atom;
  config: IRdxView<any, any, any>;
  value: any;
  prepareValue: any;
  deps: IDeps[];
  operator: IRdxSelectorOperate<any>;
  status: TaskStatus = {
    value: Status.Finish,
  };
  constructor(
    config: T,
    type?: RdxNodeType,
    operator: IRdxSelectorOperate<any> = {} as any
  ) {
    const { get } = operator;
    this.config = config;
    this.type = type;
    this.value = config.defaultValue;
    this.operator = operator;
    if (get) {
      const { value, deps } = detectValueAndDeps(this);
      this.setDeps(deps);
      this.prepareValue = value;
      this.config.reaction = async (context) => {
        const { updateState } = context;
        const value =
          this.prepareValue === null
            ? detectValueAndDeps(this).value
            : this.prepareValue;
        if (isPromise(value)) {
          const currentValue = await (value as Promise<any>);
          updateState(currentValue);
        } else {
          updateState(value);
        }
        this.prepareValue = null;
      };
      this.config.beforeReaction = () => {
        this.setLoading();
      };
      (this.config.onSingleTaskComplete = (id, context) => {
        // 动态依赖监测,获取每次依赖完成的时机，在这个时机需要去更新依赖内容
        if (this.getDeps().some((item) => item.id === id)) {
          logger.info('onSingleTaskComplete', id)
          const { value, deps } = detectValueAndDeps(this);
          this.prepareValue = value;
          // 缓存计算过后的值
          const isChange = isDifferent(this.getDeps(), deps);
          if (isChange) {
            this.setDeps(deps);
            // 触发刷新
            context.triggerSchedule(id);
          }
          // 检查deps变化
        }
      }),
        (this.config.afterReaction = () => {
          this.setLoading();
        });
    }
  }
  setLoading() {
    this.status = {
      value: Status.Running,
    };
  }
  setWaiting() {
    this.status = {
      value: Status.Waiting,
    };
  }
  reset() {
    this.value = this.config.defaultValue;
  }
  setFinish() {
    this.status = {
      value: Status.Finish,
    };
  }
  setError(msg) {
    this.status = {
      value: Status.Error,
      errorMsg: msg,
    };
  }

  setStatus(status) {
    this.status = status;
  }
  getDeps() {
    return this.config.deps || [];
  }
  setDeps(deps: IDeps[]) {
    this.config.deps = deps;
  }
  getId() {
    return this.config.id;
  }
  getValue() {
    return this.value;
  }
  setPromise(v) {
    this.prepareValue = v;
  }
  setValue(v) {
    this.value = v;
  }
}
let allAtoms = new Map<string, RdxNode<IRdxAtomConfig<any>>>();

export function registNode(id, atom: RdxNode<IRdxAtomConfig<any>>) {
  allAtoms.set(id, atom);
}
export function atom<IModel>(config: IRdxAtomConfig<IModel>) {
  const atom = new RdxNode(config);
  registNode(config.id, atom);
  return atom;
}

export function useRdxAtom(atom: RdxNode<IRdxAtomConfig<any>>) {
  // 建立atom的观察者
  const context = useRdxContextAutoId({
    displayName: atom.getId(),
    deps: [{ id: atom.getId() }],
  });
  return [
    atom.getValue(),
    (v) => {
      // 触发所有依赖项更新
      context.nextById(atom.getId(), v);
    },
  ];
}
export function useRdxAtomValue(atom: RdxNode<IRdxAtomConfig<any>>) {
  useRdxContextAutoId({ deps: [{ id: atom.config.id }] });
  return atom.getValue();
}

export type IRdxSelectorConfig<IModel> = IRdxAtomConfig<IModel> &
  IRdxSelectorOperate<IModel>;
export interface IRdxSelectorOperate<IModel> {
  get: (config: {
    get: any;
  }) => IModel | Promise<IModel> | RdxNode<IRdxSelectorConfig<IModel>>;
  set?: (config: { get: any; set: any; reset: any }, newValue: IModel) => void;
}
export function detectValueAndDeps(selector: RdxNode<IRdxSelectorConfig<any>>) {
  const deps: IDeps[] = [];
  const depsIdSets = new Set();
  let value = selector.operator.get({
    get: (atom: RdxNode<any>) => {
      const id = atom.getId();
      if (!depsIdSets.has(id)) {
        deps.push({ id: id });
        depsIdSets.add(id);
      }

      return atom.getValue();
    },
  });
  // 返回记录的依赖关系
  return { value, deps };
}
export default allAtoms;
