import React from 'react';
import 'react-sortable-tree/style.css';
import { IArray } from '../ArrayTableField';
export interface ITreeField extends IArray {
    titleKey?: string;
    trigger: React.ReactNode;
    style?: React.CSSProperties;
    renderTitle: (record: any) => React.ReactNode;
    canNodeHaveChildren: (value: any) => boolean;
}
export interface IArrayItem {
    name: string;
    value: any;
    paths: string[];
    children: React.ReactNode;
}
declare const TreeField: (props: ITreeField) => JSX.Element;
export default TreeField;
