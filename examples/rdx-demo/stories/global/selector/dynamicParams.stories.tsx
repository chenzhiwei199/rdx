import React, { useState } from 'react';
import {
  RdxContext,
  useRdxCompute,
  rdxComputeFamily,
  useRdxState,
} from '@czwcode/rdx';

const computeFamily = rdxComputeFamily({
  id: 'dynamic',
  get: (param: number) => () => {
    return param;
  },
});
const CounterView = (props: { id: number }) => {
  const [dynamic] = useRdxCompute(
    {
      id: 'dynamic',
      get: () => {
        return props.id;
      },
    },
    [props.id]
  );
  const [computeFamilyDynamic] = useRdxState(computeFamily(props.id));
  const [staticV] = useRdxCompute({
    id: 'static',
    get: () => {
      return props.id;
    },
  });

  return (
    <div>
      <div>dynamic： {dynamic}</div>
      <div>computeFamilyDynamic： {computeFamilyDynamic}</div>
      <div>staticV： {staticV}</div>
    </div>
  );
};

export const ComputeFamily用法2 = () => {
  const [state, setState] = useState(1);
  return (
    <RdxContext>
      <CounterView id={state} />
      <div onClick={() => setState(state + 1)}>id++</div>
    </RdxContext>
  );
};

export default {
  title: 'Usage',
  parameters: {
    info: { inline: true },
  },
};
