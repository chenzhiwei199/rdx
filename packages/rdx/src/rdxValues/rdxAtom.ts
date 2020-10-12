import { IRdxDeps, IRdxTask } from '../global';
import { IRdxNode, RdxNode, IRdxNodeLifeCycle, RdxNodeType } from './base';
import { isPromise } from '../utils';
import { ShareContextClass } from '../RdxContext/shareContext';
import { DataModel } from './types';
import { checkValueIsSync, getSyncValue } from './core';

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
  getTaskInfo(context: ShareContextClass) {
    const taskInfos: IRdxTask<GModel> = {
      type: RdxNodeType.Atom,
      id: this.getId(),
      deps: [] as IRdxDeps<any>[],
      reset: (context: ShareContextClass) => {
        this.reset(context);
      },
      reaction: checkValueIsSync(context, this.defaultValue)
        ? (context) => {}
        : async (context) => {
            // 设置默认值
            context.updateState(await (this.defaultValue as Promise<GModel>));
          },
    };
    return taskInfos;
  }
  init(context: ShareContextClass, force: boolean = false) {
    if (checkValueIsSync(context, this.defaultValue)) {
      // 1.如果已经有数据了，那就不用再设置默认值了，非受控的情况， 外部传入值的情况，不能把原来的数据覆盖掉了
      // 2. 默认值不为undefined的时候可以设置
      if (
        (context.getTaskStateById(this.getId()) === undefined &&
          this.defaultValue !== undefined) ||
        force
      ) {
        context.set(this.getId(), getSyncValue(context, this.defaultValue));
      }
      context.markIDeal(this.getId());
    } else {
      context.markWaiting(this.getId());
      context.batchTriggerSchedule({
        key: this.getId(),
        downStreamOnly: false,
      });
    }
  }
  reset(context: ShareContextClass) {
    this.init(context, true);
  }
  load(context: ShareContextClass) {
    context.addOrUpdateTask(this.getId(), this.getTaskInfo(context));
    this.init(context);
  }
}
