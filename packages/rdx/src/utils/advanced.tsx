import React from 'react';
import { useRdxComputeLoader } from '../hooks/stateHooks';

/**
 *
 * 构造出一个Compute，默认为loading状态，通过setValue通知节点加载完成，通过setLoading可以将节点设置
 * 为loading状态
 * @export
 * @param {{ id: string }} config
 * @returns
 */
export function pendingCompute(config: { id: string }) {
  const { id } = config;
  // 第二次之后的更新，还需要触发brider进行更新
  const customResolve = React.useRef(null);
  const [value, setValue, context] = useRdxComputeLoader({
    id: id,
    get: async () => {
      const promise = new Promise((resolve) => {
        customResolve.current = resolve;
      });
      return await promise;
    },
  });
  return {
    setValue: (value) => {
      if (context.loading) {
        customResolve.current(value);
      } else {
        context.refresh();
        customResolve.current(value);
      }
    },
    setLoading: () => {
      context.refresh();
    },
  };
}
