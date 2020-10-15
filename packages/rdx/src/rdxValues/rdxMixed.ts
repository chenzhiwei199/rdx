// import { IRdxDeps, IRdxTaskBase } from '../global';
// import { IRdxNode, RdxNode, IRdxNodeLifeCycle, RdxNodeType } from './base';
// import { ShareContextClass } from '../RdxContext/shareContext';
// import { DataModel } from './types';
// import {
//   IRdxWatcherGet,
//   IRdxWatcherOperate,
//   IRdxWatcherSet,
//   RdxWatcherNode,
// } from './RdxWatcher';
// import { RdxAtomNode } from './rdxAtom';
// import { detectValueAndDeps, IRdxTask } from '..';

// export function mixed<GModel>(config: IRdxMixedNode<GModel>): RdxNode<GModel> {
//   const atom = new RdxMixedNode<GModel>(config);
//   return atom;
// }

// export interface IRdxMixedNode<GModel>
//   extends IRdxNode,
//     IRdxWatcherOperate<GModel> {
//   virtual?: boolean,
//   defaultValue: GModel | Promise<GModel> | RdxNode<GModel>;
// }
// export class RdxMixedNode<GModel> extends RdxNode<GModel>
//   implements IRdxWatcherOperate<GModel> {
//   defaultValue: DataModel<GModel>;
//   get: IRdxWatcherGet<GModel>;
//   set?: IRdxWatcherSet<GModel>;
//   virtual?: boolean = false
//   constructor(config: IRdxMixedNode<GModel>) {
//     super(config);
//     this.defaultValue = config.defaultValue;
//     this.virtual = config.virtual
//     this.get = config.get;
//     this.set = config.set;
//   }

//   getTaskInfo(context: ShareContextClass): IRdxTask<any> {
//     const watcher = new RdxWatcherNode(this);
//     const atom = new RdxAtomNode(this);
//     const atomInfo = atom.getTaskInfo(context);
//     const watcherInfo = watcher.getTaskInfo(context);
//     return {
//       ...atomInfo,
//       ...watcherInfo,
//       getValue: this.virtual ? watcherInfo.getValue : undefined,
//       setValue: this.virtual ? watcherInfo.setValue : undefined,
//       type: RdxNodeType.Mixed,
//     };
//   }
//   load(context: ShareContextClass) {
//     const atom = new RdxAtomNode(this);
//     const watcher = new RdxWatcherNode(this);
//     detectValueAndDeps(watcher, context, true)
//     // 捕获依赖和数据
//     context.addOrUpdateTask(this.getId(), this.getTaskInfo(context));
//     atom.init(context);
//     watcher.init(context);
//   }
// }
