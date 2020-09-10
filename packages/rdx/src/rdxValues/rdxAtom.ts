import { IRdxDeps, Status, IRdxView } from '../global';
import { IRdxNode, RdxNode, registNode, IRdxNodeLifeCycle } from './base';
import { isPromise } from '../utils';
import { ShareContextClass } from '../RdxContext/shareContext';
import { ActionType, TargetType } from '../RdxContext/interface';
import { DataModel } from './types';
import { loadDefualtValue } from './core';

export interface IRdxAtomNode<IModel> extends IRdxNode {
  defaultValue: IModel | Promise<IModel> | RdxNode<IModel>;
}
export class RdxAtomNode<IModel> extends RdxNode<IModel>
  implements IRdxNodeLifeCycle<IModel> {
  private defaultValue: DataModel<IModel>;
  constructor(config: IRdxAtomNode<IModel>) {
    super(config);
    this.defaultValue = config.defaultValue;
  }
  load(context: ShareContextClass<any, any>) {
    const viewInfos: IRdxView<IModel, any> = {
      id: this.getId(),
      deps: [] as IRdxDeps<any>[],
      reaction: isPromise(this.defaultValue)
        ? async (context) => {
            context.updateState(await (this.defaultValue as Promise<IModel>));
          }
        : undefined,
    };
    loadDefualtValue(this.getId(), context, this.defaultValue);
    context.addOrUpdateTask(this.getId(), viewInfos, false);
  }
}

export function atom<IModel>(config: IRdxAtomNode<IModel>): RdxNode<IModel> {
  const atom = new RdxAtomNode<IModel>(config);
  registNode(config.id, atom);
  return atom;
}
