import React from 'react';
import {
  atom,
  compute,
  RdxContext,
  useRdxSetter,
  useRdxState,
  useRdxValue,
} from '@czwcode/rdx';
import { SketchPicker } from 'react-color';
const ColorAtom = atom({
  id: 'color',
  defaultValue: 'rgba(255,255,255,1)',
});

const  ContrastColor= compute({
  id: 'contrast-color',
  get: ({ get }) => {
    const color = get(ColorAtom);
    const rgba = color.replace(/[rgba\(\)]/g, '').split(',');
    const colorContrast = `rgba(${[
      ...rgba
        .slice(0, 3)
        .map(item => (255 - Number(item))),
      rgba[3],
    ].join(',')})`
    return colorContrast;
  },
});

const  HighLightColor= compute({
  id: 'highlight-color',
  get: ({ get }) => {
    const color = get(ColorAtom);
    const rgba = color.replace(/[rgba?\(\)]/g, '').split(',');
    // https://juejin.im/post/6844903960487149582
    return 0.213 * Number(rgba[0]) + 0.715 * Number(rgba[1]) + 0.072 * Number(rgba[2]) > 255 / 2 ?'rgba(0,0,0,1)' : 'rgba(255,255,255,1)';
  },
});
export const AtomBgControlSample = () => {
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
  const contrastColor = useRdxValue(ContrastColor);
  const highlightColor = useRdxValue(HighLightColor);
  return (
    <div>
      <div style={{ position: 'relative' }}>
        <div
          style={{
            width: 435,
            height: 435,
            background: color,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px solid grey',
          }}
        >
          <h3 style={{ color: contrastColor }}>反转颜色</h3>
          <h3 style={{ color: highlightColor }}>根据明暗</h3>
        </div>

        <div style={{ position: 'absolute', top: 10, left: 10 }}>
          <ThemeEditor />
        </div>
      </div>
    </div>
  );
};
const ThemeEditor = () => {
  const setColor = useRdxSetter(ColorAtom);
  const dataSource = ['rgba(255,255,255, 1)', 'rgba(0,0,0, 1)'];
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
