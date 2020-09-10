import { ShareContextClass, StoreValues } from '../RdxContext/shareContext';
import { IRdxAnyDeps, IRdxView } from '../global';

export enum RdxNodeType {
  Atom = 'atom',
  Watcher = 'watcher',
  Reaction = 'reaction',
}

export interface IRdxNode {
  id: string;
  type?: RdxNodeType;
}

export interface IRdxNodeLifeCycle<IModel> {
  load(context: ShareContextClass<IModel, any>): void;
}
/**
 * 基础节点
 */
export abstract class RdxNode<IModel> implements IRdxNodeLifeCycle<IModel> {
  load(context: ShareContextClass<IModel, any>): void {
    throw new Error('Method not implemented.');
  }
  private id: string;
  private type: RdxNodeType = RdxNodeType.Atom;
  constructor(config: IRdxNode) {
    this.id = config.id;
    this.type = config.type;
  }
  getType() {
    return this.type;
  }
  getId() {
    return this.id;
  }
}
let allAtoms = new Map<string, RdxNode<any>>();
export function getAllNodes() {
  return allAtoms;
}
export function registNode(id, atom: RdxNode<any>) {
  allAtoms.set(id, atom);
}

export type ValueOrUpdater<IModel> = ((preValue: IModel) => IModel) | IModel;
export type RdxGet = <IModel>(node: RdxNode<IModel> | string) => IModel;
export type RdxSet = <IModel>(
  node: RdxNode<IModel> | string,
  value: ValueOrUpdater<IModel>
) => void;
export type RdxReset = <IModel>(node: RdxNode<IModel>) => void;
