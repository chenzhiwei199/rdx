/// <reference types="react" />
export declare enum LayoutType {
    Grid = "grid",
    Inline = "inline"
}
export interface LayoutContext {
    labelCol?: number;
    wrapCol?: number;
    layoutType?: LayoutType;
    labelTextAlign?: 'left' | 'right';
}
export declare const LayoutContextInstance: import("react").Context<LayoutContext>;
