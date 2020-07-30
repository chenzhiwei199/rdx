import { LayoutContextInstance, LayoutType } from "../../hooks/formLayoutHoooks"
import React from 'react';

export const FormLayout  = (props: { labelTextAlign?: 'left' | 'right', labelCol?: number, wrapCol?: number, children: React.ReactNode}) => {
  const { children,labelCol = 8, wrapCol =  16, labelTextAlign = 'right' } = props
  return <LayoutContextInstance.Provider value={{
    layoutType: LayoutType.Grid,
    labelCol: labelCol,
    wrapCol: wrapCol,
    labelTextAlign: labelTextAlign
  }}>
    {children}
  </LayoutContextInstance.Provider>

}