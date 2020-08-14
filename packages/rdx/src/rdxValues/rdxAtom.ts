import { useRdxState, useRdxContextAutoId, useRdxContext } from "../hooks/useRdxReaction";
import { IDeps, NodeStatus} from '@czwcode/task-queue'
import { Status, IRdxView } from "../global";
import { TaskStatus } from "../RdxContext/shareContext";
import { IRdxSelectorOperate } from "./rdxSelector";
export interface IRdxAtomConfig<IModel> {
  id: string;
  defaultValue?: IModel;
}
export enum RdxNodeType {
 Atom = 'atom',
 Selector = 'selector' 
}
export class RdxNode<T extends IRdxAtomConfig<any>> {
  type: RdxNodeType = RdxNodeType.Atom
  config: IRdxView<any, any, any>;
  value: any
  deps: IDeps[]
  operator: IRdxSelectorOperate<any>
  status: TaskStatus = {
    value: Status.Finish
  }
  constructor(config: T,type?: RdxNodeType,  operator?: IRdxSelectorOperate<any>) {
    this.config = config;
    this.value = config.defaultValue
    this.operator = operator
  }
  setLoading() {
    this.status = {
      value: Status.Running
    }
  }
  setWaiting() {
    this.status = {
      value: Status.Waiting
    }
  }
  reset() {
    this.value = this.config.defaultValue
  }
  setFinish() {
    this.status = {
      value: Status.Finish
    }
  }
  setError(msg) {
    this.status = {
      value: Status.Error,
      errorMsg: msg
    }
  }
  getDeps() {
    return this.config.deps
  }
  setDeps(deps: IDeps[]) {
    this.config.deps = deps
  }
  getId() {
    return this.config.id
  }
  getValue() {
    return this.value
  }

  setValue(v) {
     this.value = v
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
  const context = useRdxContextAutoId({ deps: [{ id: atom.config.id}]})
  return [atom.getValue(), (v) => {
    // 触发所有依赖项更新
    context.nextById(atom.getId(), v)
  }]
}
export function useRdxAtomValue(atom: RdxNode<IRdxAtomConfig<any>>) {
  useRdxContextAutoId({ deps: [{ id: atom.config.id}]})
  return atom.getValue()
}
export default allAtoms