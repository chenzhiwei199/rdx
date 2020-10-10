import React from 'react';
import {
  useRdxFormGlboalState,
  useRdxFormGlobalContext,
} from '../../hooks/rdxStateFormHooks';
export default () => {
  const data = useRdxFormGlboalState();
  return (
    <div>
      <h3>表单输入数据</h3>
      <pre>{JSON.stringify(data.state, null, 2)}</pre>
    </div>
  );
};

export function PreviewTaskState() {
  const data = useRdxFormGlobalContext();
  return (
    <div>
      <h3>表单输入数据&虚拟状态数据</h3>
      {JSON.stringify(data, null, 2)}
    </div>
  );
}
export function Json2Ts() {
  // JsonToTS()
}
