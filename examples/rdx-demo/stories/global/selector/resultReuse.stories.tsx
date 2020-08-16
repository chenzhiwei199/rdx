import React from 'react';
import {
  atom,
  useRdxAtom,
  RdxContext,
  selector,
  useRdxSelector,
} from '@czwcode/rdx';
import { DevVisualGraphTool } from '@czwcode/rdx-plugins';

function waitPromise(time) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve();
    }, time * 1000);
  });
}
const wait3sSelector = selector({
  id: 'wait3sSelector',
  get: async () => {
    await waitPromise(3);
    return 3;
  },
});
const wait05sSelector = selector({
  id: 'wait05sSelector',
  get: async () => {
    await waitPromise(0.5);
    return true;
  },
});
const wait2sSelector = selector({
  id: 'wait2sSelector',
  get: async ({ get }) => {
    const toggle = get(wait05sSelector);

    if (toggle) {
      await waitPromise(2);
      return 2;
    } else {
      return 1;
    }
  },
});

const Wait2sSelectorPreview = () => {
  const [countFromSelector, setCountBySelector] = useRdxSelector(
    wait2sSelector
  );
  return (
    <div>
      <div style={{ fontSize: 20 }}>
        Preview wait2sSelectorPreview: {countFromSelector}
      </div>
    </div>
  );
};

const Wait3sSelectorPreview = () => {
  const [countFromSelector, setCountBySelector] = useRdxSelector(
    wait3sSelector
  );
  return (
    <div>
      <div style={{ fontSize: 20 }}>
        Preview wait3sSelectorPreview: {countFromSelector}
      </div>
    </div>
  );
};
const CounterView = () => {
  return (
    <div>
      <Wait2sSelectorPreview />
      <Wait3sSelectorPreview />
    </div>
  );
};
export const Atom基础用例 = () => {
  return (
    <RdxContext>
      <CounterView />
      <DevVisualGraphTool />
    </RdxContext>
  );
};

export default {
  title: 'Usage/状态复用',
  parameters: {
    info: { inline: true },
  },
};
