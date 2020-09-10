import React from 'react';
import { atom, RecoilRoot, useRecoilState, selector } from 'recoil';
const a = atom({
  key: '1',
  default: 1,
});
const b = selector({
  key: '2',
  set: () => {},
  get: async ({ get }) => {
    console.log("haha")
    return get(a) + 1;
  },
});
const D = () => {
  const [state3] = useRecoilState(b);
return <div>{state3}</div>
}
const C = () => {
  const [state, setState] = useRecoilState(a);
  const [state2, setState2] = useRecoilState(b);
  
  return (
    <div>
      <div
        onClick={() => {
          setState(state + 1);
        }}
      >
        {state}
      </div>
      <div>{state2}</div>
    </div>
  );
};
export const Atom基础用例2 = () => {
  // const [] = usereo

  return (
    <div>
      <RecoilRoot>
        <React.Suspense fallback={<div>111</div>}>
          <C />
        </React.Suspense>
      </RecoilRoot>
    </div>
  );
};

export default {
  title: 'Usage/test',
  parameters: {
    info: { inline: true },
  },
};
