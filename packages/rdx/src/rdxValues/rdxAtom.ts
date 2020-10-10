import { IRdxDeps, IRdxView } from '../global';
import { IRdxNode, RdxNode, IRdxNodeLifeCycle, RdxNodeType } from './base';
import { isPromise } from '../utils';
import { ShareContextClass } from '../RdxContext/shareContext';
import { DataModel } from './types';
import { loadDefaultValue } from './core';

export function atom<GModel>(config: IRdxAtomNode<GModel>): RdxNode<GModel> {
  const atom = new RdxAtomNode<GModel>(config);
  return atom;
}

export interface IRdxAtomNode<GModel> extends IRdxNode {
  defaultValue: GModel | Promise<GModel> | RdxNode<GModel>;
}
export class RdxAtomNode<GModel> extends RdxNode<GModel>
  implements IRdxNodeLifeCycle {
  private defaultValue: DataModel<GModel>;
  constructor(config: IRdxAtomNode<GModel>) {
    super(config);
    this.defaultValue = config.defaultValue;
  }
  load(context: ShareContextClass) {
    const viewInfos: IRdxView<GModel> = {
      type: RdxNodeType.Atom,
      id: this.getId(),
      deps: [] as IRdxDeps<any>[],
      reaction: isPromise(this.defaultValue)
        ? async (context) => {
            context.updateState(await (this.defaultValue as Promise<GModel>));
          }
        : (context) => {
            context.updateState(this.defaultValue as any);
          },
    };
    const value = loadDefaultValue(context, this.defaultValue);
    context.addOrUpdateTask(this.getId(), viewInfos, !value.ready);
    if (value.ready) {
      // TODO: 理清楚这里有几种设置默认值的条件
      // 默认值为空的情况
      // 没设置过数据的情况
      if (
        context.getTaskStateById(this.getId()) === undefined &&
        this.defaultValue !== undefined
      ) {
        context.set(this.getId(), value.data);
      }
      context.markIDeal(this.getId());
    } else {
      context.markWaiting(this.getId());
    }
  }
}
