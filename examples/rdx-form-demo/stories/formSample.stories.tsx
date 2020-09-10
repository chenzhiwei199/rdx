import React from 'react';
import {
  RdxFormContext,
  RdxFormItem,
  XComponentType,
  BaseType,
} from '@czwcode/rdx-next-form';
import { Icon } from '@alifd/next';
export default {
  title: '简单例子/物料列表',
  parameters: {
    info: { inline: true },
  },
};

export const 字符串类型 = () => {
  return (
    <RdxFormContext onChange={(value) => {}}>
      <RdxFormItem name='A' title='输入框' type={'string'} />
      <RdxFormItem
        name='B'
        title='下拉框'
        type={'string'}
        xComponent={'select'}
        dataSource={[
          {
            label: 'A',
            value: 'A',
          },
          {
            label: 'B',
            value: 'B',
          },
        ]}
      />
      <RdxFormItem
        name='C'
        title='输入框'
        type={'string'}
        xComponent={'code'}
      />
      <RdxFormItem
        name='D'
        title='输入框'
        type={'string'}
        xComponent={'color'}
      />
    </RdxFormContext>
  );
};

export const 布尔类型 = () => {
  return (
    <RdxFormContext onChange={(value) => {}}>
      <RdxFormItem name='A' title='开关' type={'boolean'} />
      <RdxFormItem
        name='B'
        title='复选框'
        type={'boolean'}
        xComponent={XComponentType.Checkbox}
      />
    </RdxFormContext>
  );
};

export const 数组 = () => {
  return (
    <RdxFormContext onChange={(value) => {}}>
      <RdxFormItem name='A' title='表格数组' type={'array'}>
        <RdxFormItem type={BaseType.Object}>
          <RdxFormItem
            type='string'
            title='字段1'
            name='a'
            default={'字段1'}
          ></RdxFormItem>
          <RdxFormItem
            type='string'
            title='字段2'
            name='b'
            default={'字段2'}
          ></RdxFormItem>
        </RdxFormItem>
      </RdxFormItem>
      <RdxFormItem
        name='B'
        title='卡片数组'
        type={'array'}
        xComponent={XComponentType.ArrayTable}
      >
        <RdxFormItem type={BaseType.Object}>
          <RdxFormItem
            type='string'
            title='字段1'
            name='a'
            default={'字段1'}
          ></RdxFormItem>
          <RdxFormItem
            type='string'
            title='字段2'
            name='b'
            default={'字段2'}
          ></RdxFormItem>
        </RdxFormItem>
      </RdxFormItem>
    </RdxFormContext>
  );
};
export const JsonView = () => {
  return (
    <RdxFormContext onChange={(value) => {}}>
      <RdxFormItem
        name='A'
        title='输入框'
        type={'string'}
        xComponent={'json'}
        default={JSON.stringify({ a: 1, b: 2 })}
      />
    </RdxFormContext>
  );
};

export const 树形数据配置 = () => {
  return (
    <RdxFormContext onChange={(value) => {}}>
      <RdxFormItem
        name='A'
        title='输入框'
        type={'array'}
        xComponent={XComponentType.Tree}
      >
        <RdxFormItem
          type={BaseType.Object}
          default={() => {
            return { id: Math.random(), a: 1, b: 2 };
          }}
        >
          <RdxFormItem type='string' title='字段1' name='a'></RdxFormItem>
          <RdxFormItem type='string' title='字段2' name='b'></RdxFormItem>
        </RdxFormItem>
      </RdxFormItem>
    </RdxFormContext>
  );
};
