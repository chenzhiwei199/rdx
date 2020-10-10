// import React from 'react';
// // import Graph, { stateColors, DISPLAY_STATE, GraphType } from './Graph';
// import echarts from 'echarts';
// import {
//   ShareContextClass,
//   NodeStatus,
//   arr2Map,
//   graphLibAdapter,
//   ISnapShot,
//   PointWithWeight,
//   IEdge,
//   useRdxStateContext,
// } from '@czwcode/rdx';
// export default <IModel, IRelyModel>() => {
//   return <div>111</div>
//   // return <ChartsRenderer context={useRdxStateContext()} />;
// };

// function drawGraph(
//   ref: any,
//   data: echarts.EChartOption.SeriesGraph.DataObject[],
//   edges: echarts.EChartOption.SeriesGraph.LinkObject[] = []
// ) {
//   if (ref) {
//     const echartsInstance = echarts.init(ref);
//     echartsInstance.resize();
//     echartsInstance.setOption({
//       series: [
//         {
//           type: 'graph',
//           roam: true,
//           layout: 'force',
//           animation: false,
//           edgeSymbol: ['circle', 'arrow'],
//           symbolSize: 50,
//           edgeSymbolSize: [4, 10],
//           data: data,
//           force: {
//             initLayout: 'circular',
//             // gravity: 1,
//             repulsion: 100,
//             edgeLength: 100,
//           },
//           links: edges,
//         },
//       ],
//     });
//   }
// }
// class ChartsRenderer<IModel> extends Graph<IModel> {
//   getRef(type: GraphType) {
//     return this[type] as HTMLDivElement;
//   }
//   drawGraphCommon(
//     type: GraphType,
//     points: (PointWithWeight & {
//       status?: NodeStatus | DISPLAY_STATE;
//       deps?: { id: string; weight?: number; label?: string }[];
//     })[]
//   ) {
//     drawGraph(
//       this.getRef(type),
//       points.map((item) => ({
//         id: item.key,
//         name: item.key,
//         itemStyle: {
//           color: stateColors[item.status] || stateColors[NodeStatus.IDeal],
//         },

//         label: {
//           formatter: (params) => {
//             const name = params.name;
//             const max = 10;
//             const newName =
//               name.length > max ? name.slice(0, max) + '...' : name;
//             return newName;
//           },
//           show: true,
//         },
//       })),
//       graphLibAdapter(points).reduce((arr, item) => {
//         return arr.concat(
//           (item.deps || []).map((dep) => {
//             const label = (dep as any).label;
//             return {
//               source: dep.id,
//               target: item.id,
//               label: {
//                 formatter: () => label,
//                 show: label,
//               },
//               lineStyle: {
//                 color: label && 'red',
//                 type: label ? 'dashed' : 'solid',
//                 curveness: 0.2,
//               },
//             };
//           })
//         );
//       }, [])
//     );
//   }
//   drawGlobal(info: ISnapShot) {
//     const { graph } = info;
//     this.drawGraphCommon(GraphType.Global, graph as any);
//   }
//   drawPreRunning(info: ISnapShot) {
//     const { preRunningPoints } = info;
//     this.drawGraphCommon(GraphType.PreRunning, preRunningPoints);
//   }
//   drawRunning(info: ISnapShot) {
//     const { currentRunningPoints, status } = info;
//     const statusMap = arr2Map(
//       status.slice(0, this.state.statusVersion),
//       (item) => item.id
//     );
//     this.drawGraphCommon(
//       GraphType.RunnningPointsCut,
//       currentRunningPoints.map((item) => ({
//         ...item,
//         status:
//           statusMap.has(item.key) && stateColors[statusMap.get(item.key).status]
//             ? stateColors[statusMap.get(item.key).status]
//             : NodeStatus.Waiting,
//       }))
//     );
//   }

//   drawTriggerPoints(info: ISnapShot) {
//     const { triggerPoints } = info;
//     this.drawGraphCommon(GraphType.Trigger, triggerPoints);
//   }
//   drawRunnningPointsNotCut(info: ISnapShot) {
//     const { currentRunningPoints: currentAllPoints } = info;
//     this.drawGraphCommon(GraphType.RunnningPointsNotCut, currentAllPoints);
//   }
//   drawEffectPoints(info: ISnapShot) {
//     const { effectPoints } = info;
//     this.drawGraphCommon(
//       GraphType.EffectPoints,
//       effectPoints.map((item) => ({
//         key: item,
//         status: NodeStatus.IDeal,
//       }))
//     );
//   }

//   drawConflictPoints(info: ISnapShot) {
//     const { conflictPoints } = info;
//     this.drawGraphCommon(
//       GraphType.ConflictPoints,
//       conflictPoints.map((item) => ({
//         key: item,
//         status: DISPLAY_STATE.CONFLICT,
//       }))
//     );
//   }
//   // drawBuildDAG(info: ISnapShot) {
//   //   const { currentRunningPoints: currentAllPoints, edgeCutFlow } = info;
//   //   // @ts-ignore
//   //   const edgeMap = arr2Map<IEdge>(
//   //     edgeCutFlow.reduce((arr, item) => arr.concat(item.edges), []),
//   //     (item) => `${item.source}---${item.target}`
//   //   );
//   //   const points = currentAllPoints.map((point) => {
//   //     const { key, deps = [] } = point;
//   //     return {
//   //       ...point,
//   //       deps: deps.map((item) => {
//   //         let normalizeItem =
//   //           typeof item === 'string' ? { id: item, weight: 1 } : item;
//   //         const edgeInfo =
//   //           edgeMap.get(`${normalizeItem.id}---${key}`) || ({} as IEdge);
//   //         return {
//   //           ...normalizeItem,
//   //           label: edgeInfo.reasonType && '原因：' + edgeInfo.reasonType,
//   //         };
//   //       }),
//   //     };
//   //   });
//   //   this.drawGraphCommon(GraphType.BuildDAG, points);
//   // }
//   initRunningDeliverGraph(info: ISnapShot): void {
//     this.drawGlobal(info);
//     this.drawPreRunning(info);
//     this.drawRunning(info);
//     this.drawTriggerPoints(info);
//     this.drawEffectPoints(info);
//     this.drawConflictPoints(info);
//     this.drawRunnningPointsNotCut(info);
//     // this.drawBuildDAG(info);
//   }
// }
