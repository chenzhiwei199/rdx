import React, { useCallback } from 'react';
import {
  RdxContext,
  Status,
  RdxView,
  DataContext,
  ReactionContext,
} from '@czwcode/rdx';
import { useRef } from 'react';
import { Button, Loading } from '@alifd/next';
export default {
  title: '场景示例|组件的状态',
  parameters: {
    info: { inline: true },
  },
};

const pause = (t: number) => new Promise((resolve) => setTimeout(resolve, t));

const BaseView = (context: DataContext<any, any, any>) => {
  const { status, id, deps = [], refresh, refreshView } = context;
  let text = '';
  let background = '';
  console.log('status: ', status);
  if (status === Status.FirstRender) {
    text = '空白状态';
  } else if (status === Status.Waiting) {
    text = '依赖项加载中...';
    background = 'rgb(0,157,248)';
  } else if (status === Status.Running) {
    text = '加载中...';
    background = 'lightyellow';
  } else if (status === Status.Error) {
    text = '错误状态';
    background = 'rgb(223,123,135)';
  } else {
    text = '理想状态';
    background = 'lightgreen';
  }
  return (
    <div
      style={{
        marginTop: 12,
        marginLeft: 12,
        fontSize: 16,
        width: 150,
        height: 76,
        borderRadius: 4,
        background: background,
      }}
    >
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          position: 'relative',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        组件Id: {id} <br />
        组件依赖: {deps.map((item) => item.id)}
        <br />
        <Button onClick={refresh}>{text}</Button>
      </div>
    </div>
  );
};
export const RdxView状态展示 = () => {
  const rdxViewProps = useRef({
    reaction: async (context: ReactionContext<any, any, any>) => {
      await pause(2000);
      context.updateState(2);
    },
    reactionThrowError: async (context) => {
      throw '错误啦';
    },
  });
  return (
    <RdxContext onChange={() => {}}>
      <div>
        <h2>Ui Stack</h2>
        <p>
          为了满足用户的个性化定制诉求，提供了
          <strong>
            Pending（加载中）、 Waiting（等待状态）、Error(错误状态)
            Ideal(理想状态)
          </strong>
          ,而Partial状态交由用户自己来处理。
        </p>
        <img
          width={600}
          src='https://img.alicdn.com/tfs/TB1aHuzKqL7gK0jSZFBXXXZZpXa-1235-611.png'
        />
      </div>
      <div style={{ display: 'flex' }}>
        <RdxView
          id={'A'}
          reaction={rdxViewProps.current.reaction}
          render={BaseView}
        />
        <RdxView
          id={'B'}
          reaction={rdxViewProps.current.reaction}
          deps={[{ id: 'A' }]}
          render={BaseView}
        />
        <RdxView
          id={'C'}
          deps={[{ id: 'B' }]}
          reaction={rdxViewProps.current.reactionThrowError}
          render={BaseView}
        />
        <RdxView
          id={'D'}
          deps={[{ id: 'C' }]}
          reaction={rdxViewProps.current.reactionThrowError}
          render={BaseView}
        />
        <RdxView
          id={'E'}
          reaction={rdxViewProps.current.reactionThrowError}
          render={BaseView}
        />
      </div>
    </RdxContext>
  );
};

// export const 其他信息传入 = () => {
//   const [state, setState] = React.useState({ a: 1 });
//   const [otherStateChange, setOtherStateChange] = React.useState({ a: 1 });
//   const produceModel1 = useCallback(async (context) => {
//     await pause(2000);
//     return 2;
//   }, []);
//   return (
//     <RdxContext onChange={() => {}}>
//       <Button
//         onClick={() => {
//           setState({ a: 2 });
//         }}
//       >
//         修改组件相关配置信息
//       </Button>
//       <Button
//         onClick={() => {
//           setOtherStateChange({ a: 2 });
//         }}
//       >
//         修改无关信息
//       </Button>
//       <RdxView
//         id={'a'}
//         moduleConfig={state}
//         reaction={produceModel1}
//         render={BaseView}
//       />
//     </RdxContext>
//   );
// };

// const areEqualForTask =  (
//   type: TaskCompareType,
//   preConfig: any,
//   nextConfig: any
// ) => {
//   if(type === TaskCompareType.UpdateTaskInfo)
// };
export const 自定义配置变更校验 = () => {
  const [state, setState] = React.useState({ a: 1 });
  const [otherStateChange, setOtherStateChange] = React.useState({ a: 1 });
  const produceModel1 = useCallback(async (context) => {
    await pause(2000);
    context.updateState(context.value + 1);
  }, []);
  return (
    <RdxContext state={{}} onChange={() => {}}>
      <h2>严格组件渲染管控</h2>
      <p>
        Rdx通过memo的方式，强行管控了组件的渲染状态，想要修改组件的渲染状态，只能通过Rdx提供的内置方法进行修改。
      </p>
      <Button.Group>
        <Button
          type='primary'
          onClick={() => {
            setState({ a: 2 });
          }}
        >
          修改相关信息
        </Button>
        <Button
          type='secondary'
          onClick={() => {
            setOtherStateChange({ a: 2 });
          }}
        >
          修改无关信息
        </Button>
      </Button.Group>

      <RdxView
        id={'a'}
        moduleConfig={state}
        reaction={produceModel1}
        render={BaseView}
      />
    </RdxContext>
  );
};
