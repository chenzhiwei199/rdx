// import { Callback } from './typings/global';
// import DeliverByCallback from './DeliverByCallback';
// import { BasePoint, Utils } from '@czwcode/graph-core';
// const { normalizeSingle2Arr } = Utils;
// export default class CommonQueue extends DeliverByCallback {
//   initExecute(
//     scope: string | null,
//     callback: (
//       currentKey: string | null,
//       isRouterEnd: boolean,
//       isCancel: () => boolean,
//       next: () => void
//     ) => void
//   ) {
//     const startPoints = this.graph.getFirstPoints(scope);
//     this.deliver(
//       startPoints.map(point => ({ key: point, scope })),
//       callback
//     );
//   }
//   /**
//    *
//    * @param who 谁的下游节点
//    */
//   notifyDownstream(who: BasePoint | BasePoint[], callback: Callback) {
//     who = normalizeSingle2Arr<BasePoint>(who);
//     this.deliver(who, callback, true);
//   }
// }
