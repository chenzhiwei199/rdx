// import { IRdxDeps, IRdxTaskBase } from '../global';
// import { IRdxNode, RdxNode, IRdxNodeLifeCycle, RdxNodeType } from './base';
// import { ShareContextClass } from '../RdxContext/shareContext';
// import { DataModel } from './types';
// import {
//   IRdxComputeGet,
//   IRdxComputeOperate,
//   IRdxComputeSet,
//   RdxComputeNode,
// } from './RdxCompute';
// import { RdxAtomNode } from './rdxAtom';
// import { detectValueAndDeps, IRdxTask } from '..';

// export function mixed<GModel>(config: IRdxMixedNode<GModel>): RdxNode<GModel> {
//   const atom = new RdxMixedNode<GModel>(config);
//   return atom;
// }

// export interface IRdxMixedNode<GModel>
//   extends IRdxNode,
//     IRdxComputeOperate<GModel> {
//   virtual?: boolean,
//   defaultValue: GModel | Promise<GModel> | RdxNode<GModel>;
// }
// export class RdxMixedNode<GModel> extends RdxNode<GModel>
//   implements IRdxComputeOperate<GModel> {
//   defaultValue: DataModel<GModel>;
//   get: IRdxComputeGet<GModel>;
//   set?: IRdxComputeSet<GModel>;
//   virtual?: boolean = false
//   constructor(config: IRdxMixedNode<GModel>) {
//     super(config);
//     this.defaultValue = config.defaultValue;
//     this.virtual = config.virtual
//     this.get = config.get;
//     this.set = config.set;
//   }

//   getTaskInfo(context: ShareContextClass): IRdxTask<any> {
//     const compute = new RdxComputeNode(this);
//     const atom = new RdxAtomNode(this);
//     const atomInfo = atom.getTaskInfo(context);
//     const computeInfo = compute.getTaskInfo(context);
//     return {
//       ...atomInfo,
//       ...computeInfo,
//       getValue: this.virtual ? computeInfo.getValue : undefined,
//       setValue: this.virtual ? computeInfo.setValue : undefined,
//       type: RdxNodeType.Mixed,
//     };
//   }
//   load(context: ShareContextClass) {
//     const atom = new RdxAtomNode(this);
//     const compute = new RdxComputeNode(this);
//     detectValueAndDeps(compute, context, true)
//     // 捕获依赖和数据
//     context.addOrUpdateTask(this.getId(), this.getTaskInfo(context));
//     atom.init(context);
//     compute.init(context);
//   }
// }
