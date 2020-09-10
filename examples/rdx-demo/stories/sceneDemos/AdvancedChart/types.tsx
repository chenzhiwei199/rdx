export const DataSourceType = 'datasource';
import { AggregateType } from '@czwcode/mock-core';
export interface DataConfig {
  // 拖拽元素的类型,用来给容器判断是否能够给拖拽进去
  type?: string;
  domainType?: DomainType;
  domainName?: string;
  code: string;
  label: string;
  index?: number;
}

export enum DomainType {
  Dimension = 'dimension',
  TimeDimension = 'time',
  All = 'all',
  Measure = 'measure',
}

export enum DomainName {
  DrillDown = 'drillDown',
  // 颜色通道
  Color = 'color',
  // X轴通道
  X = 'x',
  // y轴通道
  Y = 'y',
  LeftY = 'leftY',
  RightY = 'rightY',

  Measure = 'measure',
  LeftColor = 'leftColor',
  RightColor = 'rightColor',
  Size = 'size',
  // 表格列
  Column = 'column',
  Mark = 'mark',
  Row = 'row',
  // 筛选器中的文本和值通道
  Label = 'label',
  Value = 'value',
  ParentId = 'parentId',
  Id = 'id',
}
export interface DropConfig {
  label: string;
  domainName: DomainName;
  domainType: DomainType;
  limit?: number;
}

export interface Field {
  label: string;
  code: string;
  // 原始数据类型
  originDomainType: DomainType;
  // 视觉通道的数据类型
  domainType: DomainType;
  // 视觉通道的类型
  domainName: DomainName;
  alias?: string;
}
export interface MeasureField extends Field {
  // domianType 为指标才有这个属性
  aggregationType?: AggregateType;
  desc?: string;
}

export enum AnalysisOperate {
  Include = 'Include',
  Exclude = 'Exclude',
  DrillDown = 'DrillDown',
}

/**
 * 多维联动触发事件
 *
 * @export
 * @interface MultiDispatchEventValue
 */
export interface BaseAnalysisOperateValue {
  // 选中的数据字段
  data: string[] | string[][];
  // 依赖的事件类型
  field: string | string[];
  // 表格使用
  multipleField?: boolean;
}
/**
 * 多维联动存储数据类型
 */
export interface BaseAnalysisOperater extends BaseAnalysisOperateValue {
  // 用来排序的字段,分布式存储的时候需要用
  timestamp: number;
  // 操作类型
  operate: AnalysisOperate;
  // sourceUniqueId
  sourceUniqueId: string;
  // ?用来删除节点的, 这里应该不太需要， 删除是从组件内发起，组件内筛选项的顺序是固定的
  operateUniqueId: string;
}

export interface DrillDownAnalysisOperateValue
  extends BaseAnalysisOperater {
  // 下钻字段
  drillDownKey?: string;
  // 多维操作的下钻字段,用来展示所选内容
  drillRelationfields?: Field[];
}
