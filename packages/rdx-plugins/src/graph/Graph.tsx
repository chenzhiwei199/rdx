import * as React from 'react';
import Slider, { createSliderWithTooltip } from 'rc-slider';
import 'rc-slider/assets/index.css';
const NewSlider = createSliderWithTooltip(Slider);

import {
  ISnapShot,
  TaskEventType,
  ISnapShotTrigger,
  IStatusInfo,
} from '@czwcode/task-queue';
import { NodeStatus, Point } from '@czwcode/graph-core';
import { ShareContextClass } from '@czwcode/rdx';
import Tab from './Tab';

export enum DISPLAY_STATE {
  CANCEL = 'CANCEL',
  CONFLICT = 'CONFLICT',
}
export const stateColors = {
  [NodeStatus.Error]: 'red',
  [NodeStatus.Waiting]: 'rgb(230,189,45)',
  [NodeStatus.Finish]: 'grey',
  [NodeStatus.IDeal]: 'grey',
  [DISPLAY_STATE.CANCEL]: 'pink',
  [DISPLAY_STATE.CONFLICT]: 'purple',
  init: 'rgb(165, 189,249)',
};
export const stateLabel = {
  init: '初始化',
  [NodeStatus.Error]: '错误',
  [NodeStatus.Waiting]: '运行',
  [NodeStatus.Finish]: '运行结束',
  [DISPLAY_STATE.CANCEL]: '取消',
  [DISPLAY_STATE.CONFLICT]: '冲突',
};
export interface IGraph<IModel, IRelyModel> {
  context: ShareContextClass<IModel, IRelyModel>;
}

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
export interface IGraphState {
  version: number;
  visible: boolean;
  statusVersion: number;
}
export default abstract class Graph<
  IModel,
  IRelyModel,
> extends React.Component<IGraph<IModel, IRelyModel>, IGraphState> {
  snapShots: ISnapShot[] = [];
  temporarySnapShots: ISnapShot;
  constructor(props: IGraph<IModel, IRelyModel>) {
    super(props);
    this.state = {
      version: 0,
      visible: false,
      statusVersion: 0,
    };
  }
  getDefaultSnapShot(eventType: TaskEventType): ISnapShot {
    return {
      // 事件类型
      type: eventType,
      graph: [],
      // 原来点的运行状态
      preRunningPoints: [],
      // 触发点
      triggerPoints: [],
      // 被触发的点
      effectPoints: [],
      // 冲突的点
      conflictPoints: [],
      // 当前所有的点
      currentAllPoints: [],
      // 减枝过程
      edgeCutFlow: [],
      // 当前的点
      currentRunningPoints: [],
      // 当前点的状态
      status: [],
    } as ISnapShot;
  }

  initSnapShot(type: TaskEventType) {
    if (this.temporarySnapShots) {
      this.snapShots.push(this.temporarySnapShots);
    }
    this.temporarySnapShots = {
      ...this.getDefaultSnapShot(type),
    };
  }
  componentDidMount() {
    this.props.context.subject.on(TaskEventType.Init, (process) => {
      this.initSnapShot(TaskEventType.Init);
    });
    this.props.context.subject.on(TaskEventType.EventTrigger, (process) => {
      this.initSnapShot(TaskEventType.EventTrigger);
    });
    this.props.context.subject.on(
      TaskEventType.BatchEventTrigger,
      (process) => {
        this.initSnapShot(TaskEventType.BatchEventTrigger);
      }
    );

    this.props.context.subject.on(TaskEventType.TaskChange, (process) => {
      this.initSnapShot(TaskEventType.TaskChange);
    });
    this.props.context.subject.on(
      TaskEventType.ProcessRunningGraph,
      (process: ISnapShotTrigger) => {
        this.temporarySnapShots = { ...this.temporarySnapShots, ...process };
        const { currentRunningPoints } = process;
        if (currentRunningPoints.length === 0) {
          this.setState({
            version: this.snapShots.length,
            statusVersion: 0,
          });
        }
      }
    );

    this.props.context.subject.on(
      TaskEventType.StatusChange,
      (process: IStatusInfo) => {
        this.temporarySnapShots.status.push(process);
        const currentVersion = this.snapShots.length;
        this.setState({
          version: currentVersion,
          statusVersion: 0,
        });
        this.initRunningDeliverGraph(this.getSnapShot(currentVersion));
      }
    );
  }
  getSnapShot(version: number) {
    if (version === this.snapShots.length) {
      return this.temporarySnapShots || this.getDefaultSnapShot('' as any);
    } else {
      return this.snapShots[version] || this.getDefaultSnapShot('' as any);
    }
  }

  abstract initRunningDeliverGraph(info: ISnapShot): void;

  componentWillUnmount() {
    const ee = this.props.context.subject;
    ee.removeAllListeners(TaskEventType.Init);
    ee.removeAllListeners(TaskEventType.EventTrigger);
    ee.removeAllListeners(TaskEventType.ProcessRunningGraph);
    ee.removeAllListeners(TaskEventType.StatusChange);
    ee.removeAllListeners(TaskEventType.TaskChange);
  }

  resetStatus(version: number, statusVersion: number) {
    const current = this.getSnapShot(version) as ISnapShot;
    this.initRunningDeliverGraph(current);
  }
  getMarks() {
    let marks = {} as any;
    for (let index = 0; index < this.snapShots.length + 1; index++) {
      const type = `(${this.getSnapShot(index).type})`;
      if (this.snapShots.length === index) {
        marks[index] = `最新版本` + type;
      } else {
        marks[index] = `v-${index}${type}`;
      }
    }
    return marks;
  }
  getStatusMarks() {
    let marks = {} as any;
    for (
      let index = 0;
      index < this.getSnapShot(this.state.version).status.length + 1;
      index++
    ) {
      if (this.getSnapShot(this.state.version).status.length === index) {
        marks[index] = `最新状态`;
      } else {
        marks[index] = `s-${index}`;
      }
    }
    return marks;
  }

  render() {
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
        label: '边的构建过程',
        value: 'ProcessEdges',
        children: [
          {
            label: '运行图(去边前依赖关系)',
            value: GraphType.RunnningPointsNotCut,
          },
          {
            label: '构建DAG',
            value: GraphType.BuildDAG,
          },
          // {
          //   label: '触发节点',
          //   value: GraphType.Trigger,
          // },
          // {
          //   label: '触发新的点',
          //   value: GraphType.EffectPoints,
          // },
          // {
          //   label: '冲突的点',
          //   value: GraphType.ConflictPoints,
          // },
        ],
      },
      {
        label: '运行时图',
        value: GraphType.RunnningPointsCut,
      },
    ];
    return (
      <div>
        <div
          style={{
            display: 'inline-block',
            textDecoration: 'none',
            background: '#87befd',
            color: '#FFF',
            width: '120px',
            position: 'fixed',
            top: 50,
            right: 30,
            height: '120px',
            lineHeight: '120px',
            borderRadius: '50%',
            textAlign: 'center',
            cursor: 'pointer',
            verticalAlign: 'middle',
            overflow: 'hidden',
            transition: '.4s',
          }}
          onClick={() => {
            this.setState({
              visible: !this.state.visible,
            });
          }}
        >
          查看链路
        </div>
        {this.state.visible && (
          <div
            style={{
              position: 'fixed',
              bottom: 0,
              zIndex: 1000,
              height: '50%',
              width: '100%',
              right: 0,
              display: 'flex',
              padding: '24px 12px 40px 12px',
              borderRadius: 10,
              background: 'white',
              boxShadow: 'rgba(0,0,0,0.10) 0 1px 3px 0',
              border: '1px solid rgba(0,0,0,.1)',
              overflow: 'auto',
              whiteSpace: 'nowrap',
            }}
          >
            <div
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                flexDirection: 'column',
              }}
            >
              <div style={{ width: '100%' }}>
                <NewSlider
                  min={0}
                  max={this.snapShots.length}
                  value={this.state.version}
                  dots={true}
                  marks={this.getMarks()}
                  onChange={(value) => {
                    this.setState(
                      {
                        version: value,
                      },
                      () => {
                        this.resetStatus(value, 0);
                      }
                    );
                  }}
                  tipFormatter={(value: number) => {
                    return `版本V${value}`;
                  }}
                />
              </div>
              <div style={{ marginTop: 30, width: '100%' }}>
                状态选则{' '}
                <NewSlider
                  min={0}
                  max={this.getSnapShot(this.state.version).status.length}
                  value={this.state.statusVersion}
                  dots={true}
                  marks={this.getStatusMarks()}
                  onChange={(value) => {
                    this.setState(
                      {
                        statusVersion: value,
                      },
                      () => {
                        this.resetStatus(this.state.version, value);
                      }
                    );
                  }}
                  tipFormatter={(value: number) => {
                    return `状态V-${value}`;
                  }}
                />
              </div>
              <div style={{ marginTop: 30 }}>
                <Tab
                  onChange={() => {
                    setTimeout(() => {
                      this.initRunningDeliverGraph(
                        this.getSnapShot(this.state.version)
                      );
                    }, 500);
                  }}
                  defaultActive={GraphType.RunnningPointsCut}
                  dataSource={tabs}
                >
                  {(key, row) => {
                    return (
                      <div style={{ display: 'flex', width: '100%' }}>
                        {row.children ? (
                          row.children.map((item) => {
                            return (
                              <div>
                                <strong>{item.label}</strong>
                                <div
                                  ref={(g) => {
                                    this[item.value] = g;
                                  }}
                                  style={{
                                    width: `${100 / row.children.length}vw`,
                                    height: 200,
                                    border: '2px dashed lightgrey',
                                  }}
                                ></div>
                              </div>
                            );
                          })
                        ) : (
                          <div
                            ref={(g) => {
                              this[key] = g;
                            }}
                            style={{
                              width: 500,
                              height: 200,
                              border: '2px dashed lightgrey',
                            }}
                          ></div>
                        )}
                      </div>
                    );
                  }}
                </Tab>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
}
