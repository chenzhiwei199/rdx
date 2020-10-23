import React from 'react';
import {
  RdxFormContext,
  RdxFormItem,
  XComponentType,
  BaseType,
  setup,
} from '@czwcode/rdx-next-form';

setup();
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
      <RdxFormItem
        name='time'
        title='时间输入框'
        type={'string'}
        xComponent={'time'}
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
    <RdxFormContext onChange={(value) => {}} enabledStatePreview={true}>
      <RdxFormItem name='A' title='表格数组' type={'array'}>
        <RdxFormItem type={BaseType.Object}>
          <div style={{ display: 'flex' }}>
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
          </div>
        </RdxFormItem>
      </RdxFormItem>
      <RdxFormItem
        name='B'
        title='表格数组'
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
    <RdxFormContext enabledStatePreview={true} onChange={(value) => {}}>
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
          <RdxFormItem type='string' title='字段1' name='id'></RdxFormItem>
          <RdxFormItem type='string' title='字段1' name='a'></RdxFormItem>
          <RdxFormItem type='string' title='字段2' name='b'></RdxFormItem>
        </RdxFormItem>
      </RdxFormItem>
    </RdxFormContext>
  );
};



// export const Form = () => {
//   const [color, setColor] = useRdxState(ColorAtom);
//   return (
//     <RdxFormContext enabledStatePreview={true}>
//       <RdxNextFormItem type='object' name={'useInfo'} title={'用户信息'}>
//         <RdxNextFormItem
//           name='username'
//           type='string'
//           title='姓名'
//         ></RdxNextFormItem>
//         <RdxNextFormItem
//           name='age'
//           type='string'
//           title='年龄'
//           default={30}
//         ></RdxNextFormItem>
//         <RdxNextFormItem type='object' name={'extra'}>
//           <RdxNextFormItem
//             name='visible'
//             type='string'
//             title='visible'
//             xComponent={'select'}
//             componentProps={{
//               dataSource: [
//                 {
//                   label: '显示',
//                   value: 'show',
//                 },
//                 {
//                   label: '隐藏',
//                   value: 'hidden',
//                 },
//               ],
//             }}
            
//             default={'show'}
//           ></RdxNextFormItem>
//           <RdxNextFormItem
//             name='password'
//             type='string'
//             title='password'
//             xComponent={'select'}
//             default={30}
//           ></RdxNextFormItem>
//           <RdxNextFormItem
//             name='passwordCheck'
//             get={({ value, get }) => {
//               console.log('passwordCheck: ');
//               return {
//                 ...value,
//                 visible: get('useInfo.extra.visible').value === 'show',
//               };
//             }}
//             type='string'
//             title='password'
//             default={30}
//           ></RdxNextFormItem>
//         </RdxNextFormItem>
//       </RdxNextFormItem>
//     </RdxFormContext>
//   );
// };
