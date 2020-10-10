// import { IRdxView } from '../global';
// import { ShareContextClass } from '../RdxContext/shareContext';
// import { IRdxNode, RdxNode, registNode } from './base';

// export interface IRdxAtomFamilyNode<GModel> extends IRdxNode {
//   defaultValue: IModel;
// }
// export class RdxAtomFamilyNode<GModel> extends RdxNode<GModel> {
//   private defaultValue: any;
//   constructor(config: IRdxAtomFamilyNode<GModel>) {
//     super(config);
//     this.defaultValue = config.defaultValue;
//   }
//   getDefaultValue() {
//     return this.defaultValue;
//   }
// }

// export function atom<GModel>(config: IRdxAtomFamilyNode<GModel>): RdxNode<GModel> {
//   const atom = new RdxAtomFamilyNode<GModel>(config);
//   registNode(config.id, atom);
//   return atom;
// }

// export function createAtomTaskInfo(
//   atom: RdxNode<any>,
//   context: ShareContextClass<any, any>
// ): IRdxView<any, any> {
//   const currentAtom = atom as RdxAtomFamilyNode<any>;
//   // context.set(atom.getId(), currentAtom.getDefaultValue());
//   return {
//     id: currentAtom.getId(),
//     deps: [],
//     next: (context, id, value, options) => {
//       // 大部分代码和内置规则一直， 但是atom更新的时候，要强制刷新，需要出发watcher的依赖执行
//       //  更新状态
//       context.updateValue(id, value, options);
//       //  通知组件状态更新
//       context.triggerSchedule(id, { refresh: false });
//     },
//     defaultValue: currentAtom.getDefaultValue(),
//   };
// }
