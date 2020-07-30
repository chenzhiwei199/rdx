import ReactDOM from 'react-dom'
export * from './RdxContext';
export * from './global';
export * from './RdxView/View';
export { default as RdxView } from './RdxView/View';
export * from './utils';
export * from './RdxContext/shareContext'
export * from './hooks/useRdxReaction'
export const batchUpdate = (callback: () => void) => {
  ReactDOM.unstable_batchedUpdates(callback)
}