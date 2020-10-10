import React, { useState } from 'react';
import {
  RdxContext,
  useRdxWatcher,
  rdxWatcherFamily,
  useRdxState
} from '@czwcode/rdx';

const watcherFamily = rdxWatcherFamily({
  id: 'dynamic',
  get: (param: string) => () => {
    return param
  }
})
const CounterView = (props: { id: string}) => {
  const [dynamic] = useRdxWatcher({
    id: 'dynamic',
    get: () => {
      return props.id
    }
  }, [props.id])

  const [watcherFamilyDynamic] = useRdxState(watcherFamily(props.id))
  const [staticV ] = useRdxWatcher({
    id: 'static',
    get: () => {
      return props.id
    }
  })
  
  return (
    <div>
      <div>dynamic： {dynamic}</div>
      <div>watcherFamilyDynamic： {watcherFamilyDynamic}</div>
      <div>staticV： {staticV}</div>
    </div>
  );
};

export const WatcherFamily用法 = () => {
  const [state, setState] = useState(1)
  return (
    <RdxContext>
      <CounterView id={state}/>
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
