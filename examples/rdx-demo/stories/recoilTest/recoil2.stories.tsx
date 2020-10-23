// import React, { Suspense } from 'react';
// import {
//   selector as compute,
//   atom,
//   RecoilRoot as RdxContext,
//   useRecoilValue as useRdxValue,
//   useRecoilState as useRdxState,
//   selector,
// } from 'recoil';
// import { Menu, Grid, Button } from '@alifd/next';
// export default {
//   title: '简单例子/recoil2',
//   parameters: {
//     info: { inline: true },
//   },
// };

// const origin = atom({
//   key: 'origin',
//   default: 1,
// });

// const pause = (t: number) => new Promise((resolve) => setTimeout(resolve, t));

// const depsOrigin = selector<number>({
//   key: 'depsOrigin',
//   get: async ({ get }) => {
//     const o = get(origin);
//     await pause(2000);
//     return o + 1;
//   },
// });

// const depsOrigin3 = selector<number>({
//   key: 'depsOrigin3',
//   get: ({ get }) => {
//     return get(origin) + 1;
//   },
//   set: ({ set, get }, newValue) => {
//     set(origin, get(depsOrigin));
//   },
// });

// const depsOrigin2 = selector({
//   key: 'depsOrigin2',
//   get: async ({ get }) => {
//     console.log('hahahah', get(depsOrigin));
//     return get(depsOrigin) + 1;
//   },
// });

// const View = () => {
//   const [state, setState] = useRdxState(origin);

//   return (
//     <Button
//       onClick={() => {
//         setState(state + 1);
//       }}
//     >
//       {state}:{' '}
//       <Suspense fallback={<div>...</div>}>
//         <SmallView />
//       </Suspense>
//     </Button>
//   );
// };

// const SmallView = () => {
//   const origin1 = useRdxValue(depsOrigin);
//   const origin2 = useRdxValue(depsOrigin2);
//   const origin3 = useRdxValue(depsOrigin3);
//   return (
//     <div>
//       {origin1} :{origin2} : {origin3}
//     </div>
//   );
// };

// export const 联动Hooks例子 = () => {
//   return (
//     <RdxContext>
//       <View />
//     </RdxContext>
//   );
// };
// interface AdministrativeSource {
//   children: AdministrativeSource[];
//   value: string;
//   label: string;
// }
