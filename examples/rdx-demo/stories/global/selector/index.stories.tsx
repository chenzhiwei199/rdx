import React from 'react';
import {
  atom,
  useRdxAtom,
  RdxContext,
  useRdxAtomValue,
  selector,
  useRdxSelector,
} from '@czwcode/rdx';
import { DevVisualGraphTool } from '@czwcode/rdx-plugins';
import { Button, Input } from '@alifd/next';
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

const CounterSelector = selector({
  id: 'selector',
  get: ({ get }) => {
    return get(CounterA) + get(CounterB);
  },
});
const BaseCounterView = ({ atom }) => {
  const [value, onChange] = useRdxAtom(atom);
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
const SelectorPreview = () => {
  const [countFromSelector, setCountBySelector] = useRdxSelector(
    CounterSelector
  );
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

export const Atom基础用例 = () => {
  return (
    <RdxContext>
      <CounterView />
      {/* <DoubleCounterView />
      <OtherView /> */}
      <DevVisualGraphTool />
    </RdxContext>
  );
};

export default {
  title: 'Usage/Selector',
  parameters: {
    info: { inline: true },
  },
};
