import React from 'react';
import { atom, RdxContext, useRdxState } from '@czwcode/rdx'
const ButtonExample = (props) => (
  <button
    {...props}
    style={{
      backgroundColor: 'white',
      border: 'solid red',
      borderRadius: 20,
      padding: 10,
      cursor: 'pointer',
      ...props.style,
    }}
  />
);

// Add react-live imports you need here
const ReactLiveScope = {
  React,
  ...React,
  ButtonExample,
  atom,
  RdxContext: RdxContext,
  useRdxState: useRdxState
};

export default ReactLiveScope;