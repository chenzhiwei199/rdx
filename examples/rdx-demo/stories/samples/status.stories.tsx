// import React from 'react';
// import {
//   RdxContext,
//   Status,
//   RdxView,
//   DataContext,
//   ReactionContext,
// } from '@czwcode/rdx';
// import { useRef } from 'react';
// import { Button } from '@alifd/next';
// export default {
//   title: '场景示例/组件的状态',
//   parameters: {
//     info: { inline: true },
//   },
// };

// const pause = (t: number) => new Promise((resolve) => setTimeout(resolve, t));

// const BaseView = (context: DataContext<any, any>) => {
//   const { status, id, deps = [], refresh } = context;
//   let text = '';
//   let background = '';
//   if (status === Status.FirstRender) {
//     text = '空白状态';
//   } else if (status === Status.Waiting) {
//     text = '依赖项加载中...';
//     background = 'rgb(0,157,248)';
//   } else if (status === Status.Running) {
//     text = '加载中...';
//     background = 'lightyellow';
//   } else if (status === Status.Error) {
//     text = '错误状态';
//     background = 'rgb(223,123,135)';
//   } else {
//     text = '理想状态';
//     background = 'lightgreen';
//   }
//   return (
//     <div
//       style={{
//         marginTop: 12,
//         marginLeft: 12,
//         fontSize: 16,
//         width: 150,
//         height: 76,
//         borderRadius: 4,
//         background: background,
//       }}
//     >
//       <div
//         style={{
//           width: '100%',
//           height: '100%',
//           display: 'flex',
//           position: 'relative',
//           flexDirection: 'column',
//           alignItems: 'center',
//           justifyContent: 'center',
//         }}
//       >
//         组件Id: {id} <br />
//         组件依赖: {deps.map((item) => item)}
//         <br />
//         <Button onClick={refresh}>{text}</Button>
//       </div>
//     </div>
//   );
// };
// export const RdxView状态展示 = () => {
//   const rdxViewProps = useRef({
//     reaction: async (context: ReactionContext<any, any>) => {
//       await pause(2000);
//       context.updateState(2);
//     },
//     reactionThrowError: async (context) => {
//       throw '错误啦';
//     },
//   });
//   return (
//     <RdxContext onChange={() => {}}>
//       <div>
//         <h2>Ui Stack</h2>
//         <p>
//           为了满足用户的个性化定制诉求，提供了
//           <strong>
//             Pending（加载中）、 Waiting（等待状态）、Error(错误状态)
//             Ideal(理想状态)
//           </strong>
//           ,而Partial状态交由用户自己来处理。
//         </p>
//         <img
//           width={600}
//           src='https://img.alicdn.com/tfs/TB1aHuzKqL7gK0jSZFBXXXZZpXa-1235-611.png'
//         />
//       </div>
//       <div style={{ display: 'flex' }}>
//         <RdxView
//           id={'A'}
//           reaction={rdxViewProps.current.reaction}
//           render={BaseView}
//         />
//         <RdxView
//           id={'B'}
//           reaction={rdxViewProps.current.reaction}
//           deps={['A']}
//           render={BaseView}
//         />
//         <RdxView
//           id={'C'}
//           deps={['B']}
//           reaction={rdxViewProps.current.reactionThrowError}
//           render={BaseView}
//         />
//         <RdxView
//           id={'D'}
//           deps={['C']}
//           reaction={rdxViewProps.current.reactionThrowError}
//           render={BaseView}
//         />
//         <RdxView
//           id={'E'}
//           reaction={rdxViewProps.current.reactionThrowError}
//           render={BaseView}
//         />
//       </div>
//     </RdxContext>
//   );
// };
