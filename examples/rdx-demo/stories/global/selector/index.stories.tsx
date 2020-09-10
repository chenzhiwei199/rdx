import React from 'react';
import {
  atom,
  RdxContext,
  watcher,
  useRdxState,
} from '@czwcode/rdx';
import { DevVisualGraphTool } from '@czwcode/rdx-plugins';
import { Button, Input } from '@alifd/next';
import { RdxNode } from '../../../../../packages/rdx/src/RdxValues/base';
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

const CounterSelector = watcher({
  id: 'selectorxxx',
  get: ({ get }) => {
    return get(CounterA) + get(CounterB);
  },
});
const BaseCounterView = ({ atom }) => {
  const [value, onChange] = useRdxState(atom);
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
  const [countFromSelector, setCountBySelector] = useRdxState(
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
