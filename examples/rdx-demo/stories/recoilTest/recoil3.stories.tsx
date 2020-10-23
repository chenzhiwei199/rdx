// import { atom, selector, RecoilRoot } from 'recoil';
// import React, { useEffect, useRef, useState, Suspense } from 'react';
// import { useRecoilState } from 'recoil';
// import { useRecoilStateLoadable } from 'recoil';
// export default {
//   title: '场景问题验证2',
//   parameters: {
//     info: { inline: true },
//   },
// };

// const asyncAtom = selector({
//   key: 'asyncAtom',
//   get: async ({ get }) => {
//     console.log(111, new Date());
//     console.log(111);
//     await pause(5000);
//     console.log(333, new Date());
//     return 1;
//   },
// });
// const pause = (t: number) => new Promise((resolve) => setTimeout(resolve, t));
// const asyncComputeDepsAsyncAtom = selector({
//   key: 'asyncComputeDepsAsyncAtom',
//   get: async ({ get }) => {
//     console.log(22222, new Date());
//     console.log(222222);
//     await pause(2000);
//     console.log(4444, new Date());
//     console.log(5555, get(asyncAtom));
//     return get(asyncAtom) + 1;
//   },
// });
// const asyncComputeDepsAsyncAtom2 = selector({
//   key: 'asyncComputeDepsAsyncAtom2',
//   get: async ({ get }) => {
//     console.log(33333, new Date());
//     console.log(33333);
//     return get(asyncComputeDepsAsyncAtom) + 1;
//   },
// });
// const SyncComponent = ({ nodes }) => {
//   const [status1, staticAtomValue] = useRecoilState(nodes[0]);
//   const [status2, staticComputeValue] = useRecoilStateLoadable(nodes[1]);
//   // const [status3, staticComputeValue3] = useRecoilStateLoadable(nodes[2]);
//   const statusRef = useRef([]);
//   statusRef.current = [...statusRef.current, status1];
//   const statusRef2 = useRef([]);
//   statusRef2.current = [...statusRef2.current, status2];
//   return (
//     <div>
//       <div>1: {staticAtomValue}</div>
//       {statusRef.current.join('-')}
//       <div>2: {JSON.stringify(staticComputeValue)}</div>
//       {JSON.stringify(statusRef2.current)}
//     </div>
//   );
// };
// export const 同步更新 = () => {
//   return (
//     <RecoilRoot>
//       <Suspense fallback={<div>111</div>}>
//         <SyncComponent
//           nodes={[asyncComputeDepsAsyncAtom, asyncAtom]}
//         ></SyncComponent>
//       </Suspense>
//     </RecoilRoot>
//   );
// };

// const DDD = atom({
//   key: 'xxxxx',
//   default: 1,
// });
// const TT = () => {
//   const [state, setState] = useRecoilState(DDD);
//   return <div onClick={() => setState(state + 1)}>点击数据增加 {state}</div>;
// };
// export const 移除测试 = () => {
//   const [show, setShow] = useState(true);
//   return (
//     <RecoilRoot>
//       <div
//         onClick={() => {
//           setShow(!show);
//         }}
//       >
//         控制视图是否展示
//       </div>
//       <h4>验证组件渲染，是否影响atom中记录的数据</h4>
//       {
//         show && <TT />
//       }
//     </RecoilRoot>
//   );
// };
