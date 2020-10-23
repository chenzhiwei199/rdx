/**
 *
 * 构造出一个Compute，默认为loading状态，通过setValue通知节点加载完成，通过setLoading可以将节点设置
 * 为loading状态
 * @export
 * @param {{ id: string }} config
 * @returns
 */
export declare function pendingCompute(config: {
  id: string;
}): {
  setValue: (value: any) => void;
  setLoading: () => void;
};
