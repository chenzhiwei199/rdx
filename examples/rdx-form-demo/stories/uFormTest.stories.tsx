import React from 'react';
import { SchemaMarkupField, SchemaForm } from '@uform/next';
import { Button } from '@alifd/next';
import { useState } from 'react';
export default {
  title: '基本示例/UFormTest',
  parameters: {
    info: { inline: true },
  },
};

export const FormItemSample = () => {
  const d1 = [{ label: 1, value: 1 }];
  const d2 = [{ label: 2, value: 2 }];
  const [state, setState] = useState(d1);
  return (
    <div>
      <Button
        onClick={() => {
          setState(d2);
        }}
      >
        点击切换数据源
      </Button>
      <SchemaForm onChange={(value) => {
        console.log('value: ', value);
      }}initialValues={{}} onSubmit={(v) => console.log(v)}>
        <SchemaMarkupField
          title='数组'
          name='array'
          maxItems={3}
          type='array'
          x-props={{
            renderAddition: '这是定制的添加文案',
            renderRemove: '这是定制的删除文案',
          }}
        >
          <SchemaMarkupField type='object' default={{ aa: 33}}>
            <SchemaMarkupField name='aa' type='string' title='字段1' default={11}/>
            <SchemaMarkupField name='bb' type='string' title='字段2' default={22}/>
          </SchemaMarkupField>
        </SchemaMarkupField>
      </SchemaForm>
    </div>
  );
};

// export const FormObjecySample = () => {
//   return <FromItem title='parent' type={'object'}>
//         <FromItem name='child' title='111' type={'string'}/>
//   </FromItem>
// }
