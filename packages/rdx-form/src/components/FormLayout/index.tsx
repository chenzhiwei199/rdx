import {
  LabelTextAlign,
  LayoutContext,
  LayoutContextInstance,
  LayoutType,
} from '../../hooks/formLayoutHoooks';
import React from 'react';

export const FormLayout = (
  props: LayoutContext & { children?: React.ReactNode }
) => {
  return (
    <LayoutContextInstance.Provider
      value={props}
    >
      {props.children}
    </LayoutContextInstance.Provider>
  );
};
