import ReactDOM from 'react-dom'
export * from './utils';
export * from './RdxContext';
export * from './global';
export * from './RdxValues';
export * from './RdxContext/shareContext'
export * from './hooks/stateHooks'
export * from './hooks/hookUtils'
export const batchUpdate = (callback: () => void) => {
  ReactDOM.unstable_batchedUpdates(callback)
}