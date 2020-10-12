import React from 'react';
import {
  getData,
  getDimension,
  getDimensions,
  Operator,
} from '@czwcode/mock-core';
import {
  RdxFormContext,
  FormLayout,
  Preview,
  FormItemGrid,
  SearchListLayout,
  RdxNextFormItem,
  FormRdxStateContext,
} from '@czwcode/rdx-next-form';
import { DevVisualTableTool } from '../../../packages/rdx-plugins/src';
export default {
  title: '布局组件',
  parameters: {
    info: { inline: true },
  },
};

export const FormLayout布局 = () => {
  return (
    <RdxFormContext>
      <h3>栅格布局</h3>
      <FormLayout>
        <RdxNextFormItem
          name='usename'
          type='string'
          title={'用户名'}
          default={'张三'}
        ></RdxNextFormItem>
        <RdxNextFormItem
          name='password'
          type='string'
          title={'密码'}
        ></RdxNextFormItem>
        <RdxNextFormItem
          name='career'
          type='string'
          title={'职业'}
        ></RdxNextFormItem>
      </FormLayout>
      <Preview />
    </RdxFormContext>
  );
};

export const FormItemGrid布局 = () => {
  return (
    <RdxFormContext>
      <h3>栅格布局</h3>
      <FormItemGrid cols={[8, 8, 8]}>
        <RdxNextFormItem
          name='usename'
          type='string'
          title={'用户名'}
          default={'张三'}
        ></RdxNextFormItem>
        <RdxNextFormItem
          name='password'
          type='string'
          title={'密码'}
        ></RdxNextFormItem>
        <RdxNextFormItem
          name='career'
          type='string'
          title={'职业'}
        ></RdxNextFormItem>
      </FormItemGrid>
      <Preview />
    </RdxFormContext>
  );
};

export const FormItemGrid_FormLayout组合布局 = () => {
  return (
    <RdxFormContext>
      <h3>栅格布局</h3>
      <FormLayout>
        <FormItemGrid cols={[8, 8, 8]}>
          <RdxNextFormItem
            name='usename'
            type='string'
            title={'用户名'}
            default={'张三'}
          ></RdxNextFormItem>
          <RdxNextFormItem
            name='password'
            type='string'
            title={'密码'}
          ></RdxNextFormItem>
          <RdxNextFormItem
            name='career'
            type='string'
            title={'职业'}
          ></RdxNextFormItem>
        </FormItemGrid>
      </FormLayout>
      <Preview />
    </RdxFormContext>
  );
};

const sexData = async () => {
  await pause(3000);
  return await [
    { label: '男', value: 'man' },
    { label: '女', value: 'woman' },
  ];
};
const pause = (t: number) => new Promise((resolve) => setTimeout(resolve, t));
export const 搜索列表 = () => {
  return (
    <div style={{ background: '#F5F5F5', padding: '12px' }}>
      <RdxFormContext
        enabledStatePreview={true}
        enabledTypescriptGenerte={true}
        visualStatePlugins={
          <DevVisualTableTool context={FormRdxStateContext} />
        }
      >
        <h3>搜索列表</h3>
        <SearchListLayout cols={[8]}>
          <RdxNextFormItem
            name='usename'
            type='string'
            title={'用户名'}
            default={'张三'}
            desc={'请输入用户名称'}
          ></RdxNextFormItem>
          <RdxNextFormItem
            name='sex'
            type='string'
            get={async ({ value, get }) => {
              if (!(value.componentProps && value.componentProps.dataSource)) {
                return {
                  ...(value as any),
                  componentProps: {
                    dataSource: await sexData(),
                  },
                };
              } else {
                return value;
              }
            }}
            xComponent={'select'}
            title={'性别'}
          ></RdxNextFormItem>
          <RdxNextFormItem
            name='password'
            type='string'
            componentProps={{ placeholder: '请输入较为复杂的密码' }}
            title={'密码'}
          ></RdxNextFormItem>
          <RdxNextFormItem
            name='career'
            type='string'
            title={'职业'}
          ></RdxNextFormItem>
          <RdxNextFormItem
            name='date'
            type='string'
            tips={'请选择入职的日期'}
            require={true}
            xComponent={'time'}
            title={'入职日期'}
          ></RdxNextFormItem>
          <RdxNextFormItem
            name='date2'
            tips={'请选择离职日期'}
            type='string'
            xComponent={'time'}
            title={'离职日期'}
          ></RdxNextFormItem>
        </SearchListLayout>
      </RdxFormContext>
    </div>
  );
};

export const 异步级联列表 = () => {
  // 地区名称,业务员名称,客户分类,客户名称,存货名称,部门名称
  return (
    <div style={{ background: '#F5F5F5', padding: '12px' }}>
      <RdxFormContext
        enabledStatePreview={true}
        enabledTypescriptGenerte={true}
        visualStatePlugins={
          <DevVisualTableTool context={FormRdxStateContext} />
        }
      >
        <h3>级联搜索列表</h3>
        <SearchListLayout cols={[8]}>
          <RdxNextFormItem
            name='单据日期'
            type='string'
            get={async ({ value, get }) => {
              const data = await getDimension({
                dimensions: '单据日期',
              });
              return {
                ...(value as any),
                componentProps: {
                  dataSource: data.data,
                },
              };
            }}
            xComponent={'select'}
            title={'单据日期'}
          ></RdxNextFormItem>
          <RdxNextFormItem
            name='地区名称'
            type='string'
            get={async ({ value, get }) => {
              const data = await getDimension({
                dimensions: '地区名称',
                filters: [
                  {
                    operator: Operator.equals,
                    member: '单据日期',
                    values: get('单据日期').value,
                  },
                ],
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
          <RdxNextFormItem
            name='客户分类'
            type='string'
            get={async ({ value, get }) => {
              const data = await getDimension({
                dimensions: '客户分类',
                filters: [
                  {
                    operator: Operator.equals,
                    member: '单据日期',
                    values: get('单据日期').value,
                  },
                  {
                    operator: Operator.equals,
                    member: '地区名称',
                    values: get('地区名称').value,
                  },
                ],
              });
              return {
                ...(value as any),
                componentProps: {
                  dataSource: data.data,
                },
              };
            }}
            xComponent={'select'}
            title={'客户分类'}
          ></RdxNextFormItem>
        </SearchListLayout>
      </RdxFormContext>
    </div>
  );
};

export const CascaderListSetDefault = () => {
  // 地区名称,业务员名称,客户分类,客户名称,存货名称,部门名称
  return (
    <div style={{ background: '#F5F5F5', padding: '12px' }}>
      <RdxFormContext
        enabledStatePreview={true}
        enabledTypescriptGenerte={true}
        visualStatePlugins={
          <DevVisualTableTool context={FormRdxStateContext} />
        }
      >
        <h3>级联搜索列表</h3>
        <SearchListLayout cols={[8]}>
          <RdxNextFormItem
            name='单据日期'
            type='string'
            get={async ({ value, get }) => {
              const data = await getDimension({
                dimensions: '单据日期',
              });
              return {
                ...(value as any),
                value: data.data[0].value,
                componentProps: {
                  dataSource: data.data,
                },
              };
            }}
            xComponent={'select'}
            title={'单据日期'}
          ></RdxNextFormItem>
          <RdxNextFormItem
            name='地区名称'
            type='string'
            get={async ({ value, get }) => {
              const data = await getDimension({
                dimensions: '地区名称',
                filters: [
                  {
                    operator: Operator.equals,
                    member: '单据日期',
                    values: get('单据日期').value,
                  },
                ],
              });
              return {
                ...(value as any),
                value: data.data[0].value,
                componentProps: {
                  dataSource: data.data,
                },
              };
            }}
            xComponent={'select'}
            title={'地区名称'}
          ></RdxNextFormItem>
          <RdxNextFormItem
            name='客户分类'
            type='string'
            get={async ({ value, get }) => {
              const data = await getDimension({
                dimensions: '客户分类',
                filters: [
                  {
                    operator: Operator.equals,
                    member: '单据日期',
                    values: get('单据日期').value,
                  },
                  {
                    operator: Operator.equals,
                    member: '地区名称',
                    values: get('地区名称').value,
                  },
                ],
              });
              return {
                ...(value as any),
                value: data.data[0].value,
                componentProps: {
                  dataSource: data.data,
                },
              };
            }}
            xComponent={'select'}
            title={'客户分类'}
          ></RdxNextFormItem>
        </SearchListLayout>
      </RdxFormContext>
    </div>
  );
};
