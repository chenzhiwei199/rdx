import React from 'react';
function globalSelf() {
  try {
    if (typeof self !== 'undefined') {
      return self
    }
  } catch (e) {}
  try {
    if (typeof window !== 'undefined') {
      return window
    }
  } catch (e) {}
  try {
    if (typeof global !== 'undefined') {
      return global
    }
  } catch (e) {}
  return Function('return this')()
}
export const globalThisPolyfill = globalSelf()


const env = {
  portalDOM: null
}

export const render = (element: React.ReactElement) => {
  if (globalThisPolyfill['document']) {
    env.portalDOM =
      env.portalDOM || globalThisPolyfill['document'].createElement('div')
    return require('react-dom').createPortal(element, env.portalDOM)
  } else {
    return <template>{element}</template>
  }
}
