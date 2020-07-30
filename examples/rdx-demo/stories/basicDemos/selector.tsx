import * as React from 'react';
import {
  DataContext,
  ReactionContext,
  RdxContext,
  RdxView,
  Status,
} from '@czwcode/rdx';
import { Radio, Grid, Select } from '@alifd/next';
import { DevVisualTableTool, DevVisualGraphTool } from '@czwcode/rdx-plugins';
import { Input } from '@alifd/next';
const { Row, Col } = Grid;
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
interface IDefaultSelector extends IDefaultValueDataSourceOptions {
  chooseType: ChooseValueType;
}
interface IDefaultValueDataSourceOptions {
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
const TypeView = (context: DataContext<any, any, any>) => {
  const { value, next } = context;
  return (
    <Radio.Group
      value={value.value}
      onChange={(v) => {
        console.log('v: ', v);
        next({ ...value, value: v });
      }}
      dataSource={value.dataSource}
    ></Radio.Group>
  );
};

export interface IFromItem {
  title: string;
  value: any;
  xComponent: string;
  xType: string;
  onChange: (value: any) => void;
  xProps?: any;
  dataSource: any[];
  visible?: boolean;
}
const basicComponentMap = {
  string: Input,
};
const otherComponentMap = {
  select: Select,
};

const FromItem = (props: IFromItem) => {
  const {
    title,
    xType,
    xComponent,
    value,
    dataSource,
    onChange,
    xProps = {},
  } = props;
  const Cmp = otherComponentMap[xComponent] || basicComponentMap[xType];
  return (
    <div>
      <div>{title}</div>
      <div>
        <Cmp
          value={value}
          dataSource={dataSource}
          onChange={onChange}
          {...xProps}
        />
      </div>
    </div>
  );
};

const RelationView = (
  context: DataContext<any, any, IDefaultValueDataSourceOptions>
) => {
  const { value, next, status, depsValues, moduleConfig } = context;
  if (status === Status.FirstRender) {
    return '';
  }
  const { linkedDataType, measures, fields } = moduleConfig;
  const [chooseTypeInfo, valueTypeInfo] = depsValues;
  const chooseType = chooseTypeInfo.value;
  const valueType = valueTypeInfo.value;
  // 展示类型， 筛选和输入框
  if (
    (linkedDataType === LinkedDataType.DimensionMember &&
      valueType === BaseLinkedDefaultValueTypeEnum.SelectAll) ||
    valueType === BaseLinkedDefaultValueTypeEnum.SelectFirst
  ) {
    // 区分 类型
    return (
      <FromItem
        title='111'
        value={value}
        onChange={(value) => {}}
        dataSource={fields}
        xType={'string'}
        xComponent={'select'}
      />
    );
  }
  if (valueType === MeasureDataDefaultValueTypeEnum.CustomIndicator) {
    return (
      <Select
        // tagInline
        mode={
          chooseType === LinkedValueChooseType.Multiple ? 'multiple' : 'single'
        }
        value={value}
        dataSource={measures}
      />
    );
  }
  const inputViews = [
    DimensionDataDefaultValueTypeEnum.Custom,
    OtherDefaultValueTypeEnum.LocalStorageInfo,
    OtherDefaultValueTypeEnum.UrlParams,
  ];
  if (inputViews.includes(valueType)) {
    return <Input />;
  }
  return <div />;
};
const ValueReaction = async (
  context: ReactionContext<any, any, IDefaultValueDataSourceOptions>
) => {
  const {
    value,
    updateState,
    moduleConfig,
    lastDepsValue,
    depsValues,
  } = context;
  const [type] = depsValues;
  const [preType] = lastDepsValue;
  const { hasDataSource, linkedDataType } = moduleConfig;
  const newDataSource = value.dataSource
    .filter((item) => {
      // 如果没有数据源则过滤掉全选和默认选择第一个
      const isBaseLinkedValueType = [
        BaseLinkedDefaultValueTypeEnum.SelectFirst,
        BaseLinkedDefaultValueTypeEnum.SelectAll,
      ].includes(item.value);
      if (!hasDataSource && isBaseLinkedValueType) {
        return false;
      }
      return true;
    })
    .filter((item) => {
      if (
        linkedDataType === LinkedDataType.DimensionMember &&
        item.value === DimensionDataDefaultValueTypeEnum.Custom
      ) {
        return false;
      }
      if (
        linkedDataType === LinkedDataType.MeasureMember &&
        item.value == MeasureDataDefaultValueTypeEnum.CustomIndicator
      ) {
        return false;
      }
      return true;
    });
  // 处理数据源
  const newValue = {
    value: type === preType ? value.value : BaseLinkedDefaultValueTypeEnum.None,
    dataSource: newDataSource,
  };
  updateState(newValue);
};
const DefaultSelector = (props: IDefaultSelector) => {
  const { chooseType, hasDataSource, linkedDataType, measures, fields } = props;
  const showChooseType = chooseType !== ChooseValueType.OnlyChooseDefaultValue;
  return (
    <RdxContext>
      {showChooseType && (
        <Row>
          <Col>
            <RdxView<any, any, any, any>
              render={TypeView}
              defaultValue={{
                value: LinkedValueChooseType.Single,
                dataSource: LinkedValueChooseData,
              }}
              id={StateEnum.chooseType}
            ></RdxView>
          </Col>
        </Row>
      )}

      <Row>
        <Col>
          <RdxView<any, any, IDefaultValueDataSourceOptions, any>
            render={TypeView}
            deps={[{ id: StateEnum.chooseType }]}
            moduleConfig={{
              linkedDataType,
              hasDataSource,
              measures,
              fields,
            }}
            reaction={ValueReaction}
            defaultValue={{
              value: BaseLinkedDefaultValueTypeEnum.None,
              dataSource: defaultValueTypes,
            }}
            id={StateEnum.valueType}
          ></RdxView>
        </Col>
      </Row>
      <Row>
        <Col>
          <RdxView<any, any, IDefaultValueDataSourceOptions, any>
            render={RelationView}
            deps={[{ id: StateEnum.chooseType }, { id: StateEnum.valueType }]}
            moduleConfig={{
              linkedDataType,
              hasDataSource,
              measures,
              fields,
            }}
            id={StateEnum.relationValue}
          ></RdxView>
        </Col>
      </Row>
      <DevVisualTableTool />
      <DevVisualGraphTool />
    </RdxContext>
  );
};
export default DefaultSelector;
