import React from 'react';
import {
  RdxContext,
  RdxView,
  useRdxReaction,
  useRdxState,
  DataContext,
  ReactionContext,
  Status,
} from '@czwcode/rdx';
import { DevVisualGraphTool } from '@czwcode/rdx-plugins';
import { Input, NumberPicker, Dialog, Notification, Button } from '@alifd/next';
import { useRef } from 'react';

const View = (context: DataContext<number, any, any>) => {
  const { value, next } = context;
  return <NumberPicker value={value} onChange={next} />;
};
const TotalView = (context: DataContext<number, any, any>) => {
  const [_] = useRdxReaction({
    deps: [{ id: '单价' }, { id: '数量' }],
  });
  const { depsValues } = context;
  const [unit = 0, amount = 0] = depsValues;
  console.log('----' + 'total render');
  return <span>{unit * amount}</span>;
};
const BaseView = ({ id }) => {
  const [state, setState] = useRdxState({
    id: id,
    defaultValue: 0,
  });
  console.log(id + '----' + 'render');
  return <NumberPicker value={state} onChange={setState} />;
};

export const 总价计算 = () => {
  return (
    <RdxContext>
      <strong style={{ fontSize: 16 }}>
        展示了rdx框架的基本用法，申明式的指定当前模块的id，和依赖模块的id，并且可以从view
        和 reaction函数中获取到依赖的数据
      </strong>
      <br />
      <strong>单价:</strong>
      <BaseView id={'单价'} />
      <strong>数量:</strong>
      <BaseView id={'数量'} />
      <strong>总价:</strong>
      <RdxView
        recordStatus={false}
        id={'总价'}
        deps={[{ id: '单价' }, { id: '数量' }]}
        render={TotalView}
      ></RdxView>
      <DevVisualGraphTool />
    </RdxContext>
  );
};

