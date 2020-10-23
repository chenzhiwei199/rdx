import { IRdxDeps, IRdxTask } from '../global';
import {
  IRdxBaseState,
  RdxState,
  IRdxNodeLifeCycle,
  RdxNodeType,
} from './base';
import { ShareContextClass } from '../RdxContext/shareContext';
import { DataModel } from './types';
import { checkValueIsSync, getSyncValue } from './core';
import { TaskEventType, TaskEventTriggerType } from '../DataPersist/type';

export function atom<GModel>(config: IRdxAtomState<GModel>): RdxState<GModel> {
  const atom = new RdxAtomNode<GModel>(config);
  return atom;
}

export interface IRdxAtomState<GModel> extends IRdxBaseState {
  virtual?: boolean;
  defaultValue: GModel | Promise<GModel> | RdxState<GModel>;
}
export function rdxNodeOperates(context, virtual) {
  return {
    getValue: virtual
      ? (id) => {
          return context.getVirtualTaskState(id);
        }
      : undefined,
    setValue: virtual
      ? (id, value) => {
          return context.setVirtualTaskState(id, value);
        }
      : undefined,
  };
}
export class RdxAtomNode<GModel> extends RdxState<GModel>
  implements IRdxNodeLifeCycle {
  private defaultValue: DataModel<GModel>;
  constructor(config: IRdxAtomState<GModel>) {
    super(config);
    this.defaultValue = config.defaultValue;
    this.virtual = config.virtual;
  }
  getTaskInfo(context: ShareContextClass) {
    const taskInfos: IRdxTask<GModel> = {
      type: RdxNodeType.Atom,
      id: this.getId(),
      deps: [] as IRdxDeps<any>[],
      reset: (context: ShareContextClass) => {
        this.reset(context);
      },
      ...rdxNodeOperates(context, this.virtual),
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
      context.emitBase(TaskEventType.TaskLoadEnd)
    } else {
      context.markWaiting(this.getId());
      context.emitBase(TaskEventType.TaskLoadEnd)
      context.executeTask(
        {
          key: this.getId(),
          downStreamOnly: false,
        },
        TaskEventTriggerType.TriggerByTaskInit + '-' + this.getId()
      );
    }
  }
  reset(context: ShareContextClass) {
    this.init(context, true);
  }
  load(context: ShareContextClass) {
    context.emit(
      TaskEventType.TaskLoad,
      `${TaskEventType.TaskLoad}-${this.getId()}`
    );
    context.addOrUpdateTask(this.getId(), this.getTaskInfo(context));
    this.init(context);
  }
}
