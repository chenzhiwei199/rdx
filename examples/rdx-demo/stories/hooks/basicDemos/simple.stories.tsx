import React from 'react';
import {
  RdxContext,
  useRdxState,
  useRdxPreview
} from '@czwcode/rdx';
import { DevVisualGraphTool } from '@czwcode/rdx-plugins';
import {  NumberPicker } from '@alifd/next';


export default {
  title: '基本示例/hooks用法',
  parameters: {
    info: { inline: true },
  },
};
const TotalView = () => {
  const dataContext = useRdxState<number, [number,number], any>({
    recordStatus: false,
    id: '总价',
    deps: [{ id: '单价' }, { id: '数量' }],
  });
  const dataContext2 = useRdxState<number, [number,number], any>({
    recordStatus: false,
    id: '总价',
    deps: [{ id: '单价' }, { id: '数量' }],
  });
  const { depsValues } = dataContext;
  const [unit = 0, amount = 0] = depsValues;
  console.log('2222')
  return <span>{unit * amount}----{dataContext2.value}</span>;
};
const BaseView = ({ id }) => {
  const { value, next } = useRdxState({
    id: id,
    defaultValue: 0,
  });
  return <NumberPicker value={value} onChange={(v) => {
    console.log("v", v)
    next(v)
  }} />;
};

export const 总价计算 = () => {
  console.log("111")
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
      <TotalView />
    </RdxContext>
  );
};

