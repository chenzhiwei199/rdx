import React from 'react';
import {
  atom,
  RdxContext,
  useRdxSetter,
  useRdxState,
  useRdxValue,
} from '@czwcode/rdx';
import { SketchPicker } from 'react-color';
import { DevVisualTableTool } from '../../../rdx-plugins/src';
const ColorAtom = atom({
  id: 'color',
  defaultValue: 'white',
});

export const AtomBgControlSample = () => {
  return (
    <RdxContext >
      <div>点击像devtools发送消息</div>
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
            key={item}
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
