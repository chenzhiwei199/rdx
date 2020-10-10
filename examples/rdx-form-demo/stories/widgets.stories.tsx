import React from 'react';
import { DevVisualTableTool, DevVisualGraphTool } from '@czwcode/rdx-plugins';
import '@alifd/next/dist/next.css';
import { useState } from 'react';
import {
  RdxFormItem,
  RdxFormContext,
  Preview,
  BaseType,
  IModel,
  IRdxFormItem,
  FormRdxStateContext,
} from '@czwcode/rdx-next-form';
import { Button } from '@alifd/next';
import { PreviewTaskState } from '../../../packages/rdx-form/src/components/Preview';
export default {
  title: '表单组件',
  parameters: {
    info: { inline: true },
  },
};

export const 基础表单 = () => {
  return (
    <div>
      <RdxFormContext
        state={{ A: 2 }}
        onChange={(v) => {
          console.log('v', v);
        }}
      >
        <RdxFormItem default={'1'} name='A' title='输入框' type={'string'} />
        <RdxFormItem
          name='B'
          title='下拉框'
          type={'string'}
          dataSource={[
            { label: '测试1', value: '测试1' },
            { label: '测试2', value: '测试2' },
          ]}
          xComponent={'select'}
        />
        <Preview />
      </RdxFormContext>
    </div>
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
    <RdxFormContext onChange={(value) => {}}>
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
  interface RootType {
    a: string;
    b: string;
  }
  return (
    <RdxFormContext
      state={state}
      enabledTypescriptGenerte={true}
      onChange={(value) => {
        setState(value);
      }}
    >
      <RdxFormItem name='a' title='111' type={'string'} default={'haha'} />
      <RdxFormItem<RootType>
        name='b'
        title='111'
        type={'string'}
        xComponent={'select'}
        get={async ({ get, value }) => {
          const depsValue = get('a');

          let a = [];
          for (let i = 0; i < 5; i++) {
            a.push({
              label: depsValue.value + '-' + i,
              value: depsValue.value + '-' + i,
            });
          }
          return { ...value, dataSource: a };
        }}
      />
      <DevVisualGraphTool />
    </RdxFormContext>
  );
};

export const 展示隐藏 = () => {
  interface RootObject {
    a: string;
    b: string;
  }
  return (
    <RdxFormContext enabledTypescriptGenerte={true}>
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
      <RdxFormItem<RootObject>
        name='b'
        defaultVisible={false}
        title='111'
        type={'string'}
        get={({ get, value }) => {
          const depsValue = get('a');
          return {
            ...value,
            visible: depsValue.value === 'show',
          };
        }}
      />
      <DevVisualGraphTool />
    </RdxFormContext>
  );
};

export const 数组对象 = () => {
  return (
    <RdxFormContext
      onChange={(value) => {}}
      enabledStatePreview={true}
      enabledTypescriptGenerte={true}
    >
      <RdxFormItem name='root' title='root' type={'object'}>
        <RdxFormItem name='arr' title='arr' type={'array'}>
          <RdxFormItem type={'object'}>
            <RdxFormItem name='item' title='string' type='string'></RdxFormItem>
            <RdxFormItem name='itemObject' title='object' type='object'>
              <RdxFormItem
                name='itemObjectChild'
                title='string'
                type='string'
              ></RdxFormItem>
            </RdxFormItem>
          </RdxFormItem>
        </RdxFormItem>
      </RdxFormItem>
      {/* <DevVisualGraphTool/>
      <DevVisualTableTool /> */}
    </RdxFormContext>
  );
};

export const 字符串数组_ArrayTable = () => {
  return (
    <RdxFormContext
      enabledStatePreview={true}
      visualStatePlugins={<DevVisualTableTool context={FormRdxStateContext} />}
      enabledTypescriptGenerte={true}
      onChange={(value) => {}}
    >
      <RdxFormItem
        name='arr'
        title='数组标题'
        type={'array'}
        xComponent={'arrayTable'}
      >
        <RdxFormItem title='请输入字符串' type={'string'}></RdxFormItem>
        {/* <div></div> */}
      </RdxFormItem>
      {/* <DevVisualGraphTool/>
      <DevVisualTableTool /> */}
    </RdxFormContext>
  );
};

export const 数组对象_ArrayTable = () => {
  return (
    <RdxFormContext enabledTypescriptGenerte={true} onChange={(value) => {}}>
      <RdxFormItem name='root' title='root' type={'object'}>
        <RdxFormItem
          name='arr'
          title='arr'
          type={'array'}
          xComponent={'arrayTable'}
        >
          <RdxFormItem type={'object'}>
            <RdxFormItem name='item' title='string' type='string'></RdxFormItem>
          </RdxFormItem>
        </RdxFormItem>
      </RdxFormItem>
      <Preview />
    </RdxFormContext>
  );
};

export const 字符串数组 = () => {
  return (
    <RdxFormContext onChange={(value) => {}}>
      <RdxFormItem name='arr' title='arr' type={'array'}>
        <RdxFormItem type='string'></RdxFormItem>
      </RdxFormItem>
      <Preview />
    </RdxFormContext>
  );
};

export const 字符串嵌套数组 = () => {
  return (
    <RdxFormContext onChange={(value) => {}} enabledTypescriptGenerte={true}>
      <RdxFormItem name='arr' title='嵌套数组' type={'array'}>
        <RdxFormItem name='arr' title='arr' type={'array'}>
          <RdxFormItem type='string'></RdxFormItem>
        </RdxFormItem>
      </RdxFormItem>
      <Preview />
      <PreviewTaskState />
    </RdxFormContext>
  );
};

export const 字符串多层嵌套数组 = () => {
  return (
    <RdxFormContext onChange={(value) => {}} enabledTypescriptGenerte={true}>
      <RdxFormItem name='arr' title='嵌套数组' type={'array'}>
        <RdxFormItem type={'object'}>
          <RdxFormItem name='arr2' title='嵌套的数组标题' type={'array'}>
            <RdxFormItem title={'字符串'} type='string'></RdxFormItem>
          </RdxFormItem>
        </RdxFormItem>
      </RdxFormItem>
      <Preview />
    </RdxFormContext>
  );
};

export const 强依赖关系 = () => {
  interface RootObject {
    total: number;
    unit: number;
    amount: number;
  }
  return (
    <RdxFormContext onChange={(value) => {}} enabledTypescriptGenerte={true}>
      {/* <DevVisualTableTool /> */}

      <RdxFormItem
        default={100}
        title='单价'
        name='unit'
        type='number'
      ></RdxFormItem>
      <RdxFormItem
        default={50}
        title='数量'
        name='amount'
        type={BaseType.Number}
      ></RdxFormItem>
      <RdxFormItem<RootObject>
        set={({ get, set, value }, newValue) => {
          const amount = get('total');
          const unit = get('unit');
          set('amount', {
            ...amount,
            value: newValue.value / unit.value,
          });
        }}
        get={({ get, value }) => {
          const amount = get('amount');
          console.log('33333 amount: ', amount);
          const unit = get('unit');
          console.log('33333 unit: ', unit);
          return {
            ...value,
            value: amount.value * unit.value,
          };
        }}
        title='总价'
        name='total'
        type='number'
      ></RdxFormItem>
      {/* <DevVisualGraphTool /> */}
    </RdxFormContext>
  );
};

export const 基础表单_校验 = () => {
  return (
    <RdxFormContext>
      <RdxFormItem require name='A' title='输入框2' type={'string'} />
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
