import React from 'react';
import { atom, RecoilRoot, useRecoilState, selector } from 'recoil';
const a = atom({
  key: '1',
  default: 1,
});
window.aaaaa = a;
const b = selector({
  key: '2',
  get: ({ get }) => {
    return get(a) + 1;
  },
});
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
        <C />
      </RecoilRoot>
      <RecoilRoot>
        <C />
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
