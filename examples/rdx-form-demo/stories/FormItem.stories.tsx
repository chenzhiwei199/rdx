import React from 'react';
import { DevVisualTableTool, DevVisualGraphTool } from '@czwcode/rdx-plugins';
import '@alifd/next/dist/next.css';
import { useState } from 'react';
import { RdxFormItem, RdxFormContext, FormLayout } from '@czwcode/rdx-next-form';
import { Button } from '@alifd/next';
export default {
  title: '基本示例/FormItem',
  parameters: {
    info: { inline: true },
  },
};

export const 基础表单 = () => {
  return (
    <RdxFormContext>
      <RdxFormItem name='A' title='输入框' type={'string'} />
      <RdxFormItem
        name='B'
        title='下拉框'
        type={'string'}
        dataSource={[{ label: '测试1', value: '测试2' }]}
        xComponent={'select'}
      />
    </RdxFormContext>
  );
};

export const 表单对象 = () => {
  return (
    <RdxFormContext>
      <RdxFormItem name='parent' title='parent' type={'object'}>
        <RdxFormItem name='child' title='111' type={'string'} />
      </RdxFormItem>
      <DevVisualGraphTool />
    </RdxFormContext>
  );
};

export const 多对象嵌套 = () => {
  return (
    <RdxFormContext>
      <RdxFormItem name='parent1' title='parent' type={'object'}>
        <RdxFormItem name='child-1' title='111' type={'string'} />
        <RdxFormItem name='parent2' title='parent' type={'object'}>
          <RdxFormItem name='child-2' title='111' type={'string'} />
        </RdxFormItem>
      </RdxFormItem>
      <DevVisualGraphTool />
      <DevVisualTableTool />
    </RdxFormContext>
  );
};

export const 非受控例子 = () => {
  const [state, setState] = useState();
  return (
    <RdxFormContext
      initializeState={state}
      onChange={(v) => {
        console.log('v: ', v);
        setState(v);
      }}
    >
      <RdxFormItem name='parent1' title='parent' type={'object'}>
        <RdxFormItem name='child-1' title='111' type={'string'} />
        <RdxFormItem name='child-2' title='111' type={'string'} />
        <RdxFormItem name='parent2' title='parent' type={'object'}>
          <RdxFormItem name='child-3' title='111' type={'string'} />
        </RdxFormItem>
      </RdxFormItem>
    </RdxFormContext>
  );
};

export const 默认值配置 = () => {
  return (
    <RdxFormContext
      onChange={(value) => {
        console.log('value: ', value);
      }}
    >
      <RdxFormItem name='a' title='111' type={'string'} default={'haha'} />
      <RdxFormItem name='b' title='111' type={'string'} default={'hehe'} />
      <DevVisualGraphTool />
    </RdxFormContext>
  );
};

export const 受控例子 = () => {
  const [state, setState] = useState({});
  return (
    <RdxFormContext
      state={state}
      onChange={(value) => {
        console.log('state: ', value);
        setState(value);
      }}
    >
      <Button
        onClick={() => {
          setState({
            a: '11111',
          });
        }}
      >
        修改数据
      </Button>
      <RdxFormItem name='a' title='111' type={'string'} default={'haha'} />
      <DevVisualGraphTool />
    </RdxFormContext>
  );
};

export const 联动例子 = () => {
  const [state, setState] = useState({});
  return (
    <RdxFormContext
      state={state}
      onChange={(value) => {
        console.log('state: ', value);
        setState(value);
      }}
    >
      <RdxFormItem name='a' title='111' type={'string'} default={'haha'} />
      <RdxFormItem
        name='b'
        deps={[{ id: 'a' }]}
        title='111'
        type={'string'}
        xComponent={'select'}
        reaction={async (context) => {
          const { depsValues, updateState, value, moduleConfig } = context;
          const [depsValue] = depsValues;

          let a = [];
          for (let i = 0; i < 5; i++) {
            a.push({
              label: depsValue.value + '-' + i,
              value: depsValue.value + '-' + i,
            });
          }
          updateState({ ...value, dataSource: a });
        }}
      />
      <DevVisualGraphTool />
    </RdxFormContext>
  );
};

export const 展示隐藏 = () => {
  return (
    <RdxFormContext>
      <RdxFormItem
        name='a'
        title='111'
        type={'string'}
        xComponent={'radio'}
        dataSource={[
          { label: '展示', value: 'show' },
          { label: '隐藏', value: 'hidden' },
        ]}
      />
      <RdxFormItem
        name='b'
        defaultVisible={false}
        deps={[{ id: 'a' }]}
        title='111'
        type={'string'}
        reaction={(context) => {
          const { depsValues, updateState, value, moduleConfig } = context;
          const [depsValue] = depsValues;

          updateState({ ...value, visible: depsValue.value === 'show' });
        }}
      />
      <DevVisualGraphTool />
    </RdxFormContext>
  );
};

export const 数组对象 = () => {
  return (
    <RdxFormContext
      onChange={(value) => {
        console.log('state: ', value);
      }}
    >
      <RdxFormItem name='root' title='root' type={'object'}>
        <RdxFormItem name='arr' title='arr' type={'array'}>
          <RdxFormItem type={'object'}>
            <RdxFormItem name='item' title='string' type='string'></RdxFormItem>
          </RdxFormItem>
        </RdxFormItem>
      </RdxFormItem>
      {/* <DevVisualGraphTool/>
      <DevVisualTableTool /> */}
    </RdxFormContext>
  );
};

export const 字符串数组 = () => {
  return (
    <RdxFormContext
      onChange={(value) => {
        console.log('state: ', value);
      }}
    >
      <RdxFormItem name='root' title='root' type={'object'}>
        <RdxFormItem name='arr' title='arr' type={'array'}>
          <RdxFormItem type='string'></RdxFormItem>
        </RdxFormItem>
      </RdxFormItem>
    </RdxFormContext>
  );
};

export const 字符串多层嵌套数组 = () => {
  return (
    <RdxFormContext
      onChange={(value) => {
        console.log('state: ', value);
      }}
    >
      <RdxFormItem name='root' title='root' type={'object'}>
        <RdxFormItem name='arr' title='arr' type={'array'}>
          <RdxFormItem name='arr' title='arr' type={'array'}>
            <RdxFormItem type='string'></RdxFormItem>
          </RdxFormItem>
        </RdxFormItem>
      </RdxFormItem>
    </RdxFormContext>
  );
};

export const 强依赖关系 = () => {
  return (
    <RdxFormContext
      onChange={(value) => {
        console.log('state: ', value);
      }}
    >
      {/* <DevVisualTableTool /> */}
      <RdxFormItem name='root' title='root' type={'object'}>
        <RdxFormItem
          deps={[{ id: '单价' }, { id: '数量' }]}
          compute={(value, context) => {
            const { nextById, depsValues } = context;
            const [unit, amount] = depsValues;
            nextById('root.数量', {
              ...amount,
              value: value / unit.value,
            });
          }}
          reaction={(context) => {
            const { updateState, value, depsValues } = context;
            const [unit, amount] = depsValues;
            console.log('reaction', unit.value * amount.value);
            updateState({
              ...value,
              value: unit.value * amount.value,
            });
          }}
          title='总价'
          name='总价'
          type='string'
        ></RdxFormItem>
        <RdxFormItem
          default={100}
          title='单价'
          name='单价'
          type='string'
        ></RdxFormItem>
        <RdxFormItem
          default={50}
          title='数量'
          name='数量'
          type='string'
        ></RdxFormItem>
      </RdxFormItem>

      {/* <DevVisualGraphTool /> */}
    </RdxFormContext>
  );
};


export const 基础表单_校验 = () => {
  return (
    <RdxFormContext>
      <RdxFormItem require  name='A' title='输入框2' type={'string'} />
      <RdxFormItem
        name='B'
        title='下拉框'
        type={'string'}
        dataSource={[{ label: '测试1', value: '测试2' }]}
        xComponent={'select'}
      />
    </RdxFormContext>
  );
};