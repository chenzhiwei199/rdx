import React, { useEffect, useRef } from 'react';
import {
  BaseType,
  FormItemGrid,
  LabelTextAlign,
  FormLayout,
  RdxFormContext,
  RdxNextFormItem,
  LayoutType,
  useRdxFormCompute,
  useRdxFormComputeLoader,
  SearchListLayout,
  SearchList,
} from '@czwcode/rdx-next-form';
import {
  useRdxComputeLoader,
  atom,
  useRdxState,
  RdxContext,
  useRdxCompute,
  pendingCompute,
} from '@czwcode/rdx';
import { Table } from '@alifd/next';
import {
  AggregateType,
  CancelToken,
  getData,
  getDimension,
  Operator,
} from '@czwcode/mock-core';

export default {
  title: '场景案例',
  parameters: {
    info: { inline: true },
  },
};
const SearchAtom = atom({
  id: 'search',
  defaultValue: { 地区名称: '' },
});

const InputSearchList = () => {
  const [value, setValue] = useRdxState(SearchAtom);
  // 如何等待RdxFormCntext加载完成，之前应该是loading状态
  // 1. markWatting
  // 2. markFinish
  // 3. resolve
  return (
    <RdxFormContext
      initializeState={SearchAtom}
      onChange={(value) => {
        setValue(value);
      }}
    >
      <FormLayout
        labelTextAlign={LabelTextAlign.Right}
        layoutType={LayoutType.Inline}
      >
        <RdxNextFormItem
          type={BaseType.String}
          title={'地区名称'}
          name='地区名称'
        ></RdxNextFormItem>
      </FormLayout>
    </RdxFormContext>
  );
};

const SearchListSelect = () => {
  const { setValue } = pendingCompute({ id: 'search' });
  return (
    <RdxFormContext
      onChange={(value) => {
        setValue(value);
      }}
    >
      <FormLayout
        labelTextAlign={LabelTextAlign.Right}
        layoutType={LayoutType.Inline}
      >
        <RdxNextFormItem
          name='地区名称'
          type='string'
          get={async ({ value, get }) => {
            const data = await getDimension({
              dimensions: '地区名称',
            });
            return {
              ...(value as any),
              componentProps: {
                dataSource: data.data,
              },
            };
          }}
          xComponent={'select'}
          title={'地区名称'}
        ></RdxNextFormItem>
      </FormLayout>
    </RdxFormContext>
  );
};

const MultiSelectCascader = () => {
  const dimensions = ['地区名称', '单据日期', '客户分类'];
  const { setValue, setLoading } = pendingCompute({ id: 'search' });
  return (
    <RdxFormContext
      onChange={(value) => {
        setValue(value);
      }}
      onLoading={() => {
        setLoading();
      }}
    >
      <FormLayout
        labelTextAlign={LabelTextAlign.Right}
        layoutType={LayoutType.Inline}
      >
        {dimensions.map((item, index) => (
          <RdxNextFormItem
            name={item}
            type='string'
            get={async ({ value, get }) => {
              const data = await getDimension({
                dimensions: item,
                filters: dimensions.slice(0, index).map((item, colIndex) => ({
                  member: item,
                  operator: Operator.contains,
                  // @ts-ignore
                  values: get(item).value,
                })),
              });
              return {
                ...(value as any),
                componentProps: {
                  dataSource: data.data,
                },
              };
            }}
            
            xComponent={'select'}
            title={item}
          ></RdxNextFormItem>
        ))}
      </FormLayout>
    </RdxFormContext>
  );
};

const SearchListCascader = () => {
  const dimensions = ['地区名称', '单据日期', '客户分类'];
  const { setValue } = pendingCompute({ id: 'search' });
  return (
    <SearchList
      cols={[8]}
      onSearch={(value) => {
        setValue(value);
      }}
    >
      {dimensions.map((item, index) => (
        <RdxNextFormItem
          name={item}
          type='string'
          get={async ({ value, get }) => {
            const data = await getDimension({
              dimensions: item,
              filters: dimensions.slice(0, index).map((item, colIndex) => ({
                member: item,
                operator: Operator.contains,
                // @ts-ignore
                values: get(item).value,
              })),
            });
            return {
              ...(value as any),
              componentProps: {
                dataSource: data.data,
              },
            };
          }}
          xComponent={'select'}
          title={item}
        ></RdxNextFormItem>
      ))}
    </SearchList>
  );
};

const SearchListCascaderForm = (props: { children }) => {
  const dimensions = ['地区名称', '单据日期', '客户分类'];
  const [value, setValue] = useRdxState(SearchAtom);
  return (
    <RdxFormContext
      initializeState={SearchAtom}
      onChange={(value) => {
        setValue(value);
      }}
    >
      <FormLayout
        labelTextAlign={LabelTextAlign.Right}
        layoutType={LayoutType.Inline}
      >
        {dimensions.map((item, index) => (
          <RdxNextFormItem
            name={item}
            type='string'
            get={async ({ value, get }) => {
              const data = await getDimension({
                dimensions: item,
                filters: dimensions.slice(0, index).map((item, colIndex) => ({
                  member: item,
                  operator: Operator.contains,
                  // @ts-ignore
                  values: get(item).value,
                })),
              });
              return {
                ...(value as any),
                componentProps: {
                  dataSource: data.data,
                },
              };
            }}
            xComponent={'select'}
            title={item}
          ></RdxNextFormItem>
        ))}
      </FormLayout>
      {props.children}
    </RdxFormContext>
  );
};
const TableView = () => {
  const dimensions = ['地区名称', '单据日期', '客户分类'];
  const [value, setValue, context] = useRdxComputeLoader({
    id: 'table',
    defaultValue: [],
    get: async ({ get }) => {
      const searchData = get(SearchAtom);
      const fetchData = await getData({
        dimensions: dimensions,
        measures: [{ key: '税费', aggregateType: AggregateType.Sum }],
        filters: dimensions
          .filter((item) => searchData[item])
          .map((item) => ({
            member: item,
            operator: Operator.contains,
            values: searchData[item],
          })),
      });
      return fetchData.data;
    },
  });
  return (
    <Table dataSource={value} loading={context.loading}>
      {dimensions.map((item) => (
        <Table.Column title={item} dataIndex={item}></Table.Column>
      ))}
      <Table.Column title='税费' dataIndex='税费'></Table.Column>
    </Table>
  );
};

const FormTableView = () => {
  const dimensions = ['地区名称', '单据日期', '客户分类'];
  const [value, setValue, context] = useRdxFormComputeLoader({
    id: 'table',
    defaultValue: {
      value: [],
    },
    get: async ({ value, get, callbackMapWhenConflict }) => {
      const fetchData = await getData({
        dimensions: dimensions,
        measures: [{ key: '税费', aggregateType: AggregateType.Sum }],
        filters: dimensions
          .filter((item) => get(item).value)
          .map((item) => ({
            member: item,
            operator: Operator.contains,
            values: get(item).value,
          })),
      });
      return { ...value, value: fetchData.data };
    },
  });
  return (
    <Table
      dataSource={context.loading ? [] : value.value}
      loading={context.loading}
    >
      {dimensions.map((item) => (
        <Table.Column title={item} dataIndex={item}></Table.Column>
      ))}
      <Table.Column title='税费' dataIndex='税费'></Table.Column>
    </Table>
  );
};
export const 模糊搜索列表 = () => {
  return (
    <RdxContext>
      <InputSearchList />
      <TableView />
    </RdxContext>
  );
};

export const 下拉筛选搜索列表 = () => {
  return (
    <RdxContext>
      <SearchListSelect />
      <TableView />
    </RdxContext>
  );
};

export const 级联搜索列表 = () => {
  return (
    <RdxContext>
      <MultiSelectCascader></MultiSelectCascader>
      <TableView />
    </RdxContext>
  );
};
export const 带查询按钮的级联搜索列表 = () => {
  return (
    <RdxContext>
      <SearchListCascader></SearchListCascader>
      <TableView />
    </RdxContext>
  );
};
export const 表单内级联搜索列表 = () => {
  return (
    <SearchListCascaderForm>
      <FormTableView />
    </SearchListCascaderForm>
  );
};
