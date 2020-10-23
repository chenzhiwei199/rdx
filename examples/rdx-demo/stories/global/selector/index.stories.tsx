import React from 'react';
import { atom, RdxContext, compute, useRdxState } from '@czwcode/rdx';
import { Button, NumberPicker } from '@alifd/next';
const CounterA = atom({
  id: 'count111A',
  defaultValue: 0,
});

const CounterB = atom({
  id: 'count222B',
  defaultValue: 0,
});

const CounterC = atom({
  id: 'count333C',
  defaultValue: 0,
});

const CounterSelector = compute({
  id: 'selectorxxx',
  get: ({ get }) => {
    return get(CounterA) + get(CounterB);
  },
});
const BaseCounterView = ({ atom }) => {
  const [value, onChange] = useRdxState(atom) as [number, (v: number) => void];
  return (
    <div>
      <Button
        onClick={() => {
          onChange(value + 1);
        }}
      >
        +
      </Button>
      <span>
        {/* // @ts-ignore */}
        <NumberPicker
          value={value}
          onChange={(v) => onChange(v)}
        ></NumberPicker>
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
const SelectorPreview = () => {
  const [countFromSelector, setCountBySelector] = useRdxState(CounterSelector);
  return (
    <div style={{ fontSize: 20 }}>Preview selector: {countFromSelector}</div>
  );
};
const CounterView = () => {
  return (
    <div>
      <BaseCounterView atom={CounterA}></BaseCounterView>
      <BaseCounterView atom={CounterB}></BaseCounterView>
      <BaseCounterView atom={CounterC}></BaseCounterView>
      <SelectorPreview />
    </div>
  );
};

export const Selector用法 = () => {
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
