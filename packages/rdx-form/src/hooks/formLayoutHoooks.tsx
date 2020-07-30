import { createContext } from "react";

export enum LayoutType {
  Grid = 'grid',
  Inline = 'inline',
}
export interface LayoutContext {
  labelCol?: number;
  wrapCol?: number;
  layoutType?: LayoutType;
  labelTextAlign?: 'left' | 'right'
}
export  const LayoutContextInstance = createContext<LayoutContext>({});
