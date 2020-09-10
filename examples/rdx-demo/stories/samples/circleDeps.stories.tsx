import React from 'react';
import { RdxContext, useRdxAtom, useRdxWatcher } from '@czwcode/rdx';
import { NumberPicker } from '@alifd/next';
import ErrorBoundary from 'antd/lib/alert/ErrorBoundary';
export default {
  title: '简单例子/useRdxAtom&useRdxWatcher',
  parameters: {
    info: { inline: true },
  },
};

const view = ({ label, value, next }) => {
  return (
    <div style={{ display: 'flex' }}>
      <div style={{ flexBasis: 100 }}>{label}:</div>
      <NumberPicker
        value={value}
        onChange={(v) => {
          next(v);
        }}
      ></NumberPicker>
    </div>
  );
};

enum View {
  Total = 'Total',
  Unit = 'Unit',
  Amount = 'Amount',
}
const defaultValue = 3;
const Unit = () => {
  const [state, setState] = useRdxAtom({
    id: View.Unit,
    defaultValue,
  });
  return view({ label: View.Unit, value: state, next: setState });
};

const Amount = () => {
  const [state, setState] = useRdxAtom({
    id: View.Amount,
    defaultValue,
  });
  return view({ label: View.Amount, value: state, next: setState });
};

const Total = () => {
  const [state, setState] = useRdxWatcher<number>({
    id: View.Total,
    get: ({ get }) => {
      return get<number>(View.Unit) * get<number>(View.Amount);
    },
    set: ({ set, get }, value) => {
      set(View.Amount, value / get<number>(View.Unit));
    },
  });
  return view({ label: View.Total, value: state, next: setState });
};
// 同步的情况有问题，没有获取到最新的状态，
export const 数量_单价_总价 = () => {
  return (
    <ErrorBoundary>
      <RdxContext>
        <Amount></Amount>
        <Unit></Unit>
        <Total></Total>
      </RdxContext>
    </ErrorBoundary>
  );
};
