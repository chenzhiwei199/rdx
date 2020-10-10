import React from 'react';
import { atom, RdxContext, useRdxState, useRdxValue } from '@czwcode/rdx';
import { Button, Input } from '@alifd/next';
const Counter = atom({
  id: 'test',
  defaultValue: 0,
});

const CounterView = () => {
  const [count, setCount] = useRdxState(Counter);

  return (
    <div>
      <Button
        onClick={() => {
          setCount(count + 1);
        }}
      >
        +
      </Button>
      <span>
        {/* // @ts-ignore */}
        <Input value={count} onChange={setCount}></Input>
      </span>
      <Button
        onClick={() => {
          setCount(count - 1);
        }}
      >
        -
      </Button>
    </div>
  );
};

const DoubleCounterView = () => {
  const count = useRdxValue(Counter);

  return (
    <div
      style={{
        lineHeight: '40px',
        background: 'white',
        border: '1px solid grey',
      }}
    >
      双倍数据： {count * 2}
    </div>
  );
};

const OtherView = () => {
  return (
    <div
      style={{
        lineHeight: '40px',
        background: 'white',
        border: '1px solid grey',
      }}
    >
      {' '}
      不更新
    </div>
  );
};
export const Atom基础用法 = () => {
  return (
    <RdxContext>
      <CounterView />
      <DoubleCounterView />
      <OtherView />
    </RdxContext>
  );
};

export default {
  title: 'Usage',
  parameters: {
    info: { inline: true },
  },
};
