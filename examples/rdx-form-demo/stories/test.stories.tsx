import React, { useEffect, useState } from 'react';
import { Button, Input } from '@alifd/next';
import { RdxContext, useRdxAtom, useRdxWatcher} from '@czwcode/rdx'
export default {
  title: 'React 生命周期测试',
  parameters: {
    info: { inline: true },
  },
};

const B = ({ v }: { v?: any }) => {
  console.log('Init');
  useEffect(() => {
    console.log('Mount');
    return () => {
      console.log('unMount');
    };
  }, []);
  return <div>{v} --- virtual</div>;
};

const C = ({ v, index }: { v?: any, index }) => {
  console.log('Init');
  const [state, setState,  atom]= useRdxAtom({
    id: v,
    defaultValue: v
  })
  const [atomState, setAtomState] = useRdxAtom({
    id: index,
    defaultValue: atom 
  })

  useEffect(() => {
    console.log('Mount');
    return () => {
      console.log('unMount');
    };
  }, []);
  return <Input value={atomState} onChange={setState} />;
};
export const a = () => {
  const [state, setState] = useState(0);
  return (
    <div>
      <Button onClick={() => setState(state + 1)}> 修改状态</Button>
      <B key={state} />
    </div>
  );
};

export const AA = () => {
  const [isReverse, setReverse] = useState(false);
  let data = [1, 2];
  if (isReverse) {
    data = data.reverse();
  }
  return (
    <RdxContext>
      <Button onClick={() => setReverse(!isReverse)}>修改状态</Button>
      {data.map((item, index) => (
        <C key={item} v={item} index={index}/>
      ))}
    </RdxContext>
  );
};
