import ReactDOM from 'react-dom'
export * from './RdxContext';
export * from './global';
export * from './RdxValues';
export * from './utils';
export * from './RdxContext/shareContext'
export * from './hooks/stateHooks'
export const batchUpdate = (callback: () => void) => {
  ReactDOM.unstable_batchedUpdates(callback)
}