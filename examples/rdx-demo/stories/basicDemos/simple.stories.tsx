import React from 'react';
import {
  RdxContext,
  RdxView,
  DataContext,
  ReactionContext,
  Status,
} from '@czwcode/rdx';
import { Input, NumberPicker, Dialog, Notification, Button } from '@alifd/next';
import { useRef } from 'react';

const View = (context: DataContext<number, any, any>) => {
  const { value, next } = context;
  return <NumberPicker value={value} onChange={next} />;
};
const TotalView = (context: DataContext<number, any, any>) => {
  const { depsValues } = context;
  const [unit = 0, amount = 0] = depsValues;
  return <span>{unit * amount}</span>;
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
      <RdxView id={'单价'} component={View} defaultValue={10}></RdxView>
      <strong>数量:</strong>
      <RdxView id={'数量'} render={View} defaultValue={10}></RdxView>
      <strong>总价:</strong>
      <RdxView
        id={'数量'}
        deps={[{ id: '单价' }, { id: '数量' }]}
        render={TotalView}
      ></RdxView>
    </RdxContext>
  );
};

const TotalViewFromNet = (context: DataContext<number, any, any>) => {
  const { errorMsg, value, status, refresh } = context;
  let text = value as any;
  if (status === Status.Running || status === Status.Waiting) {
    text = 'loading...';
  }
  if (status === Status.Error) {
    text = errorMsg;
  }
  return (
    <span>
      {text}{' '}
      <Button
        onClick={() => {
          refresh(value);
        }}
      >
        刷新
      </Button>
    </span>
  );
};
const pause = (t: number) => new Promise((resolve) => setTimeout(resolve, t));
const reaction = async (
  context: ReactionContext<any, [number, number], any>
) => {
  const { updateState, depsValues } = context;
  const [unit, amount] = depsValues;
  // 模拟网络请求
  if (!unit) {
    throw '单价未输入';
  } else if (!amount) {
    throw '数量未输入';
  }
  await pause(2000);
  updateState(unit * amount);
};
export const 总价计算_响应函数 = () => {
  return (
    <RdxContext>
      <strong style={{ fontSize: 16 }}>
        响应式仅当当前模块的依赖项发生了改变的时候才会调用，
        比如总价依赖单价和数量，当单价或数量改变的时候，
        reaction函数将会被调用。
      </strong>
      <br />
      <strong>单价:</strong>
      <RdxView id={'单价'} render={View}></RdxView>
      <strong>数量:</strong>
      <RdxView id={'数量'} render={View}></RdxView>
      <strong>总价:</strong>
      <RdxView<any, [number, number], any, any>
        id={'总价'}
        reaction={reaction}
        deps={[{ id: '单价' }, { id: '数量' }]}
        render={TotalViewFromNet}
      ></RdxView>
    </RdxContext>
  );
};

export const 总价计算_请求取消 = () => {
  const ref = useRef({
    reaction: async (context: ReactionContext<any, [number, number], any>) => {
      const { updateState, depsValues, callbackMapWhenConflict } = context;
      const [unit, amount] = depsValues;
      callbackMapWhenConflict(() => {
        Notification.notice({
          title: '请求取消',
          content: '请求被取消啦',
        });
      });
      // 校验模块
      if (!unit) {
        throw '单价未输入';
      } else if (!amount) {
        throw '数量未输入';
      }
      // 模拟网络请求
      await pause(2000);
      updateState(unit * amount);
    },
  });
  return (
    <RdxContext>
      <strong style={{ fontSize: 16 }}>
        响应式的方法中，
        你可以向callbackMapWhenConflict方法中进行你清楚副作用的工作。例如请求的取消。
        响应式的方法中，
        可以通过updateState的方法更更新当前模块的数据，通过throw方法直接抛出异常，
        或者进行校验。
      </strong>
      <br />
      <strong>单价:</strong>
      <RdxView id={'单价'} render={View}></RdxView>
      <strong>数量:</strong>
      <RdxView id={'数量'} render={View}></RdxView>
      <strong>总价:</strong>
      <RdxView<any, [number, number], any, any>
        id={'总价'}
        reaction={ref.current.reaction}
        deps={[{ id: '单价' }, { id: '数量' }]}
        render={TotalViewFromNet}
      ></RdxView>
    </RdxContext>
  );
};

export default {
  title: '基本示例|简单用法',
  parameters: {
    info: { inline: true },
  },
};
