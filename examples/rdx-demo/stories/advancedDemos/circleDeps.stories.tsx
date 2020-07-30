import React, { useCallback } from 'react';
import {
  RdxContext,
  Status,
  RdxView,
  ReactionContext,
  ReactionType,
  DataContext,
} from '@czwcode/rdx';
import { DevVisualGraphTool } from '@czwcode/rdx-plugins';
import { NumberPicker } from '@alifd/next';
export default {
  title: '场景示例|循环依赖',
  parameters: {
    info: { inline: true },
  },
};

const view = (context) => {
  const { value, next } = context;
  return (
    <NumberPicker
      value={value}
      onChange={(v) => {
        next(v);
      }}
    ></NumberPicker>
  );
};

enum View {
  Total = 'Total',
  Unit = 'Unit',
  Amount = 'Amount',
}
const bigWeight = 100;
const smallWeight = 10;
const data = [
  {
    id: View.Total,
    label: '总价',
    deps: [
      { id: View.Amount, weight: bigWeight },
      { id: View.Unit, weight: bigWeight },
    ],
    reaction: (context: ReactionContext<number, [number, number], any>) => {
      const { updateState, value, depsValues } = context;
      const [amount, unit] = depsValues;
      if (!amount || !unit) {
        return updateState(value);
      }
      updateState(amount * unit);
    },
  },
  {
    id: View.Amount,
    label: '数量',
    deps: [
      { id: View.Total, weight: bigWeight },
      { id: View.Unit, weight: smallWeight },
    ],
    reaction: (context: ReactionContext<number, [number, number], any>) => {
      const { updateState: udpateState, value, depsValues } = context;
      const [total, unit] = depsValues;
      if (!total || !unit) {
        udpateState(value);
      }
      udpateState(total / unit);
    },
  },
  {
    id: View.Unit,
    label: '单价',
    deps: [
      { id: View.Total, weight: smallWeight },
      { id: View.Amount, weight: smallWeight },
    ],
    reaction: (context: ReactionContext<number, [number, number], any>) => {
      const { updateState, value, depsValues } = context;
      const [total, amount] = depsValues;
      if (!total || !amount) {
        updateState(value);
      }
      updateState(total / amount);
    },
  },
];
const defaultValue = 3;
// 同步的情况有问题，没有获取到最新的状态，
export const 环联动 = () => {
  return (
    <RdxContext>
      {data.map((item, index) => {
        return (
          <span>
            <div>{item.label}</div>
            <RdxView<number, any, any, any>
              id={item.id}
              reaction={item.reaction}
              deps={item.deps}
              reactionType={ReactionType.Sync}
              defaultValue={defaultValue}
              render={view}
            ></RdxView>
          </span>
        );
      })}
      <DevVisualGraphTool />
    </RdxContext>
  );
};

const data2 = [
  {
    id: View.Total,
    label: '总价',
    deps: [
      { id: View.Amount, weight: bigWeight },
      { id: View.Unit, weight: bigWeight },
    ],
    view: (context: DataContext<any, any, any>) => {
      const { value, depsValues, nextById } = context;
      const [amount, unit] = depsValues;
      return (
        <NumberPicker
          value={value}
          onChange={(v) => {
            nextById(View.Amount, v / unit);
          }}
        ></NumberPicker>
      );
    },
    reaction: (context: ReactionContext<number, [number, number], any>) => {
      const { updateState, value, depsValues } = context;
      const [amount, unit] = depsValues;
      if (!amount || !unit) {
        updateState(value);
      }
      updateState(amount * unit);
    },
  },
  {
    id: View.Amount,
    label: '数量',
    deps: [
      { id: View.Total, weight: bigWeight },
      { id: View.Unit, weight: smallWeight },
    ],
    view: (context) => {
      const { value, next } = context;
      return (
        <NumberPicker
          value={value}
          onChange={(v) => {
            next(v);
          }}
        ></NumberPicker>
      );
    },
    reaction: (context: ReactionContext<number, [number, number], any>) => {
      const { updateState: udpateState, value, depsValues } = context;
      const [total, unit] = depsValues;
      if (!total || !unit) {
        udpateState(value);
      }
      udpateState(total / unit);
    },
  },
  {
    id: View.Unit,
    label: '单价',
    deps: [
      { id: View.Total, weight: smallWeight },
      { id: View.Amount, weight: smallWeight },
    ],
    view: (context) => {
      const { value, next } = context;
      return (
        <NumberPicker
          value={value}
          onChange={(v) => {
            next(v);
          }}
        ></NumberPicker>
      );
    },
    reaction: (context: ReactionContext<number, [number, number], any>) => {
      const { updateState, value, depsValues } = context;
      const [total, amount] = depsValues;
      if (!total || !amount) {
        updateState(value);
      }
      updateState(total / amount);
    },
  },
];
