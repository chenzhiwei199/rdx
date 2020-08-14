export * from './taskUtils'

export function isPromise(obj) {
  return (
    !!obj &&
    (typeof obj === 'object' || typeof obj === 'function') &&
    typeof obj.then === 'function'
  );
}


export function isAsyncFunction (asyncFn) {
  const AsyncFunction = (async () => {}).constructor;
  const GeneratorFunction = (function* () {} ).constructor;

  return (asyncFn instanceof AsyncFunction && AsyncFunction !== Function && AsyncFunction !== GeneratorFunction) === true  || isPromise(asyncFn)
}