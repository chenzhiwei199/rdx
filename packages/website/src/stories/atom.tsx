import React from 'react';
import { atom, RdxContext, useRdxSetter, useRdxState, useRdxValue } from '@czwcode/rdx';
import { SketchPicker } from 'react-color';
import { setup, RdxFormContext, RdxNextFormItem } from '@czwcode/rdx-next-form';
import '@alifd/next/dist/next.css';
setup();
const ColorAtom = atom({
  id: 'color',
  defaultValue: 'white',
});

export const AtomBgControl = () => {
  return (
    <RdxContext>
      <div style={{ display: 'flex' }}>
        <Canvas />
        <ColorEditor />
      </div>
    </RdxContext>
  );
};

const Canvas = () => {
  const color = useRdxValue(ColorAtom);
  return (
    <div>
      <div style={{ position: 'relative' }}>
        <div
          style={{
            width: 435,
            height: 435,
            background: color,
            border: '1px solid grey',
          }}
        />
        <div style={{ position: 'absolute', top: 10, left: 10 }}>
          <ThemeEditor />
        </div>
      </div>
    </div>
  );
};
const ThemeEditor = () => {
  const setColor = useRdxSetter(ColorAtom);
  const dataSource = ['#fff', '#000'];
  return (
    <div>
      <div style={{ display: 'flex' }}>
        {dataSource.map((item) => (
          <div
            onClick={() => {
              setColor(item);
            }}
            style={{
              marginLeft: 12,
              border: '1px solid grey',
              background: item,
              width: 32,
              height: 32,
              borderRadius: '50%',
            }}
          ></div>
        ))}
      </div>
      <div style={{ color: 'orange' }}>点击我可以切换画布颜色哦!!</div>
    </div>
  );
};

const ColorEditor = () => {
  const [color, setColor] = useRdxState(ColorAtom);
  return (
    <SketchPicker
      color={color}
      onChange={(v) => {
        const { a, r, g, b } = v.rgb;
        setColor(`rgba(${r},${g},${b},${a}`);
      }}
    />
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
