export enum ChooseValueType {
  Value = 'Value',
  /**
   * 日期选择
   */
  Date = 'Date',
  /**
   * 仅数值类型选择
   */
  OnlyChooseType = 'OnlyChooseType',
  /**
   * 仅默认值选择
   */
  OnlyChooseDefaultValue = 'OnlyChooseDefaultValue',
}
export enum LinkedDataType {
  DimensionMember = 'dimensionMember',
  MeasureMember = 'measureMember',
}
export interface IDefaultSelector extends IDefaultValueDataSourceOptions {
  chooseType: ChooseValueType;
}
export interface IDefaultValueDataSourceOptions {
  hasDataSource: boolean;
  linkedDataType: LinkedDataType;
  measures: { label: string; value: string }[];
  fields: { label: string; value: string }[];
}
export enum LinkedValueChooseType {
  Single = 'Single',
  Multiple = 'Multiple',
}
export const LinkedValueChooseData = [
  {
    label: '单选',
    value: LinkedValueChooseType.Single,
  },
  {
    label: '多选',
    value: LinkedValueChooseType.Multiple,
  },
];

export enum BaseLinkedDefaultValueTypeEnum {
  SelectAll = 'selectAll',
  None = 'None',
  SelectFirst = 'selectFirst',
}
export enum DimensionDataDefaultValueTypeEnum {
  Custom = 'custom',
}
export enum MeasureDataDefaultValueTypeEnum {
  CustomIndicator = 'customIndicator',
}
export enum OtherDefaultValueTypeEnum {
  UrlParams = 'urlParams',
  LocalStorageInfo = 'localStorageInfo',
}
export enum DateDefaultValueTypeEnum {
  TodayDiff = 'todayDiff',
  YesterdayDiff = 'lastDayDiff',
  CustomDate = 'customDate',
}
export const defaultValueTypes = [
  {
    label: '空值',
    value: BaseLinkedDefaultValueTypeEnum.None,
  },
  {
    label: '全选',
    value: BaseLinkedDefaultValueTypeEnum.SelectAll,
    tag: LinkedValueChooseType.Multiple,
  },
  {
    label: '选中第一个',
    value: BaseLinkedDefaultValueTypeEnum.SelectFirst,
  },
  {
    label: '自定义维度成员',
    value: DimensionDataDefaultValueTypeEnum.Custom,
  },

  {
    label: '自定义指标选择',
    value: MeasureDataDefaultValueTypeEnum.CustomIndicator,
  },
  {
    label: '用户信息存储',
    value: OtherDefaultValueTypeEnum.LocalStorageInfo,
  },
  {
    label: '链接参数',
    value: OtherDefaultValueTypeEnum.UrlParams,
  },
];
export enum StateEnum {
  chooseType = 'chooseType',
  valueType = 'valueType',
  relationValue = 'relationValue',
}