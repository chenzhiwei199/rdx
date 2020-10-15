import React, { useRef } from 'react';
import echarts from 'echarts';
import {
  DataPersistSnapShot,
  DISPLAY_STATE,
  ISnapShot,
  stateColors,
} from '@czwcode/rdx-plugin-base';
import {
  PointWithWeight,
  NodeStatus,
  graphLibAdapter,
  arr2Map,
  useForceUpdate,
} from '@czwcode/rdx';
import Tab from '../graph/Tab';

function drawGraph(
  ref: any,
  data: echarts.EChartOption.SeriesGraph.DataObject[],
  edges: echarts.EChartOption.SeriesGraph.LinkObject[] = []
) {
  if (ref) {
    const echartsInstance = echarts.init(ref);
    echartsInstance.resize();
    echartsInstance.setOption({
      tooltip: {},
      series: [
        {
          type: 'graph',
          roam: true,
          layout: 'force',
          animation: false,
          edgeSymbol: ['circle', 'arrow'],
          symbolSize: 50,
          edgeSymbolSize: [4, 10],
          data: data,
          force: {
            initLayout: 'circular',
            // gravity: 1,
            repulsion: 100,
            edgeLength: 100,
          },
          links: edges,
        },
      ],
    });
  }
}

// export const stateColors = {
//   [NodeStatus.Error]: 'red',
//   [NodeStatus.Waiting]: 'rgb(230,189,45)',
//   [NodeStatus.Finish]: 'grey',
//   [NodeStatus.IDeal]: 'grey',
//   [DISPLAY_STATE.CANCEL]: 'pink',
//   [DISPLAY_STATE.CONFLICT]: 'purple',
//   init: 'rgb(165, 189,249)',
// };
export enum GraphType {
  Global = 'Global',
  PreRunning = 'PreRunning',
  Trigger = 'Trigger',
  EffectPoints = 'EffectPoints',
  ConflictPoints = 'ConflictPoints',
  AllPointsNow = 'AllPointsNow',
  RunnningPointsNotCut = 'RunnningPointsNotCut',
  BuildDAG = 'BuildDAG',
  RunnningPointsCut = 'RunnningPointsCut',
}

const tabs = [
  {
    label: '全局关系图',
    value: GraphType.Global,
  },
  {
    label: '新的节点构建过程',
    value: 'ProcessPoint',
    children: [
      {
        label: '运行时图(旧)',
        value: GraphType.PreRunning,
      },
      {
        label: '触发节点',
        value: GraphType.Trigger,
      },
      {
        label: '触发新的点',
        value: GraphType.EffectPoints,
      },
      {
        label: '冲突的点',
        value: GraphType.ConflictPoints,
      },
    ],
  },
  {
    label: '运行时图',
    value: GraphType.RunnningPointsCut,
  },
];
export const GlobalDepsViewer = ({
  width = 500,
  height = 500,
  snapShot,
}: {
  width?: number;
  height?: number;
  snapShot: DataPersistSnapShot;
}) => {
  const ref = useRef<{ [key: string]: HTMLDivElement }>({});
  function getRef(type: GraphType) {
    return ref.current[type] as HTMLDivElement;
  }
  const forceUpdate = useForceUpdate();
  React.useEffect(() => {
    function drawGraphCommon(
      type: GraphType,
      points: (PointWithWeight & {
        status?: NodeStatus | DISPLAY_STATE;
        deps?: { id: string; weight?: number; label?: string }[];
      })[]
    ) {
      getRef(type) &&
        drawGraph(
          getRef(type),
          points.map((item) => ({
            id: item.key,
            name: item.key,
            itemStyle: {
              color: stateColors[item.status] || stateColors[NodeStatus.IDeal],
            },

            label: {
              formatter: (params) => {
                const name = params.name;
                const max = 10;
                const newName =
                  name.length > max ? name.slice(0, max) + '...' : name;
                return newName;
              },
              show: true,
            },
          })),
          graphLibAdapter(points).reduce((arr, item) => {
            return arr.concat(
              (item.deps || []).map((dep) => {
                const label = (dep as any).label;
                return {
                  source: dep.id,
                  target: item.id,
                  label: {
                    formatter: () => label,
                    show: label,
                  },
                  lineStyle: {
                    color: label && 'red',
                    type: label ? 'dashed' : 'solid',
                    curveness: 0.2,
                  },
                };
              })
            );
          }, [])
        );
    }
    function drawGlobal(info: ISnapShot) {
      const { graph } = info;
      drawGraphCommon(GraphType.Global, graph as any);
    }
    function drawPreRunning(info: ISnapShot) {
      const { preRunningPoints } = info;
      drawGraphCommon(GraphType.PreRunning, preRunningPoints);
    }
    function drawRunning(info: ISnapShot) {
      const { currentRunningPoints, status } = info;
      const statusMap =
        new Map() ||
        arr2Map(status.slice(0, this.state.statusVersion), (item) => item.id);
      drawGraphCommon(
        GraphType.RunnningPointsCut,
        currentRunningPoints.map((item) => ({
          ...item,
          status:
            statusMap.has(item.key) &&
            stateColors[statusMap.get(item.key).status]
              ? stateColors[statusMap.get(item.key).status]
              : NodeStatus.Waiting,
        }))
      );
    }

    function drawTriggerPoints(info: ISnapShot) {
      const { triggerPoints } = info;
      drawGraphCommon(GraphType.Trigger, triggerPoints);
    }
    function drawRunnningPointsNotCut(info: ISnapShot) {
      const { currentRunningPoints: currentAllPoints } = info;
      drawGraphCommon(GraphType.RunnningPointsNotCut, currentAllPoints);
    }
    function drawEffectPoints(info: ISnapShot) {
      const { effectPoints } = info;
      drawGraphCommon(
        GraphType.EffectPoints,
        effectPoints.map((item) => ({
          key: item,
          status: NodeStatus.IDeal,
        }))
      );
    }

    function drawConflictPoints(info: ISnapShot) {
      const { conflictPoints } = info;
      drawGraphCommon(
        GraphType.ConflictPoints,
        conflictPoints.map((item) => ({
          key: item,
          status: DISPLAY_STATE.CONFLICT,
        }))
      );
    }
    drawGlobal(snapShot);
    drawPreRunning(snapShot);
    drawRunning(snapShot);
    drawTriggerPoints(snapShot);
    drawEffectPoints(snapShot);
    drawConflictPoints(snapShot);
    drawRunnningPointsNotCut(snapShot);
  });
  return (
    <div>
      <Tab
        defaultActive={GraphType.RunnningPointsCut}
        dataSource={tabs}
        onChange={() => {
          forceUpdate();
        }}
      >
        {(key, row) => {
          return (
            <div style={{ display: 'flex', width: '100%' }}>
              {row.children ? (
                row.children.map((item) => {
                  return (
                    <div style={{ flex: 1}}>
                      <strong>{item.label}</strong>
                      <div
                        ref={(g) => {
                          ref.current[item.value] = g;
                        }}
                        style={{
                          flex: 1,
                          height: 200,
                          border: '2px dashed lightgrey',
                        }}
                      ></div>
                    </div>
                  );
                })
              ) : (
                <div
                  key={'single'}
                  ref={(g) => {
                    ref.current[key] = g;
                  }}
                  style={{
                    width: '100%',
                    height: height,
                    border: '2px dashed lightgrey',
                  }}
                ></div>
              )}
            </div>
          );
        }}
      </Tab>
    </div>
  );
};
