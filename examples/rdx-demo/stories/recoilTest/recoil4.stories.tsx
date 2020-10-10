import { Input } from '@alifd/next';
import React, { Suspense } from 'react';
import { useRecoilState } from 'recoil';
import { RecoilRoot, atom, selector} from 'recoil'
export default {
  title: 'recoil',
  parameters: {
    info: { inline: true },
  },
};

const staticState = atom({
  key: '静态状态',
  default: ''
})

const dynamicState = selector<string>({
  key: '动态状态',
  get: async ({ get}) => {
    return get(staticState)
  },
  set: ({get, set}, value) => {
    set(staticState, value)
  }
})

const dynamicState2 = selector<string>({
  key: '动态状态2',
  get: ({ get}) => {
    return get(dynamicState)
  },
  set: ({get, set}, value) => {
    set(dynamicState, value)
  }
})

const Test = () => {
  const [value, setValue] = useRecoilState(dynamicState2)
  return <Input value={value} onChange={setValue}/>
}
export const 输入测试 = () => {
  return <RecoilRoot>
    <Suspense fallback={<div>loading</div>}>
      <Test />
    </Suspense>
  </RecoilRoot>
}