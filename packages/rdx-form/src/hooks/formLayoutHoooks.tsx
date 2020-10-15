import { createContext, useContext } from "react";

export enum LayoutType {
  Grid = 'grid',
  Inline = 'inline',
  Base = 'Base',
}

export enum LabelTextAlign {
  Left = 'left',
  Right = 'right',
  Top = 'top',
}
export interface LayoutContext {
  labelCol?: number;
  wrapCol?: number;
  labelWidth?: number;
  wrapWidth?: number;
  layoutType?: LayoutType;
  labelTextAlign?: LabelTextAlign
  autoRow?: boolean
  columns?: number
}
export  const LayoutContextInstance = createContext<LayoutContext>({});
function getWidth(col: number, max: number  = 24) {
  const colspan = (col / max) * 100;
  return `${colspan}%`;
}

export function createLayout(span) {
  const layout = useContext(LayoutContextInstance)
  const { layoutType = LayoutType.Base,columns = 3, autoRow = false, labelWidth ,labelTextAlign = 'right', labelCol = 8, wrapWidth , wrapCol = 8} = layout
  const containerStyle:React.CSSProperties = {}
  const labelStyle:React.CSSProperties = {}
  const contentStyle:React.CSSProperties = {}
  if(layoutType === LayoutType.Base) {
    containerStyle.display = 'flex'
    if(labelTextAlign === LabelTextAlign.Top) {
      containerStyle.flexDirection = 'column'
    } else {
      labelStyle.textAlign = labelTextAlign
    }
    labelStyle.flex = `0 0 ${getWidth(labelCol)}`
    contentStyle.flex = `0 0 ${getWidth(wrapCol)}`
  } else if(layoutType === LayoutType.Inline) {
    containerStyle.display = 'inline-block'
    if(labelTextAlign === LabelTextAlign.Right || labelTextAlign === LabelTextAlign.Left) {
      labelStyle.display = 'inline-block'
      contentStyle.display = 'inline-block'
      labelStyle.textAlign = labelTextAlign
    }
    labelStyle.width = labelWidth
    contentStyle.width = wrapWidth
    contentStyle.marginRight = 20
  } else if(layoutType === LayoutType.Grid) {
    containerStyle.display = 'flex'
    containerStyle.flexWrap = autoRow ? 'wrap' : 'nowrap'
    if(labelTextAlign === LabelTextAlign.Top) {
      containerStyle.flexDirection = 'column'
    } else {
      labelStyle.textAlign = labelTextAlign
    }
    labelStyle.flex = `0 0 ${getWidth(span, columns)}`
    contentStyle.flex = `0 0 ${getWidth(span, columns)}`
    
  }
  return {
    containerStyle,
    labelStyle,
    contentStyle
  }
}