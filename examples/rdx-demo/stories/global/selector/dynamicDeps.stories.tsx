import React from 'react';
import { atom, RdxContext, compute, useRdxState } from '@czwcode/rdx';

import { Button, Input, Checkbox } from '@alifd/next';
const toggleAtom = atom({
  id: 'toggle1',
  defaultValue: true,
});

const CounterA = atom({
  id: 'countAtomA1',
  defaultValue: 1,
});

const CounterB = atom({
  id: 'countAtomB2',
  defaultValue: 2,
});

const Countercompute = compute({
  id: 'compute3',
  get: ({ get }) => {
    if (get(toggleAtom)) {
      return get(CounterA);
    } else {
      return get(CounterB);
    }
  },
});

const ToggleView = () => {
  const [value, onChange] = useRdxState(toggleAtom);
  return (
    <div>
      <strong>开关控制按钮，动态切换依赖关系</strong>
      <Checkbox onChange={onChange} checked={value} />
    </div>
  );
};
const BaseCounterView = ({ title, atom }) => {
  const [value, onChange] = useRdxState<any>(atom);
  return (
    <div>
      <strong>{title}</strong>
      <Button
        onClick={() => {
          onChange(value + 1);
        }}
      >
        +
      </Button>
      <span>
        {/* // @ts-ignore */}
        <Input value={value} onChange={onChange}></Input>
      </span>
      <Button
        onClick={() => {
          onChange(value - 1);
        }}
      >
        -
      </Button>
    </div>
  );
};
const ComputePreview = () => {
  const [countFromcompute, setCountBycompute] = useRdxState(Countercompute);
  return (
    <div>
      <div style={{ fontSize: 20 }}>Preview compute: {countFromcompute}</div>
      <div>
        tips:
        当开关开启的时候，展示累加器A的值，当开关关闭的时候，展示累加器B的值
      </div>
    </div>
  );
};
const CounterView = () => {
  return (
    <div>
      <ToggleView />
      <BaseCounterView title={'累加器A'} atom={CounterA}></BaseCounterView>
      <BaseCounterView title={'累加器B'} atom={CounterB}></BaseCounterView>
      <ComputePreview />
    </div>
  );
};
export const 动态依赖示例 = () => {
  return (
    <RdxContext>
      <CounterView />
    </RdxContext>
  );
};

export default {
  title: 'Usage',
  parameters: {
    info: { inline: true },
  },
};
