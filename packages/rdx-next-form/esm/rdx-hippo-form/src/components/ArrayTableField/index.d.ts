import React from 'react';
export interface IArray {
    value: any[];
    onChange: (v: any[]) => void;
    name: string;
    paths?: string[];
    children: React.ReactNode;
}
export interface IArrayItem {
    name: string;
    value: any;
    paths: string[];
    children: React.ReactNode;
}
declare const Array: (props: IArray) => JSX.Element;
export default Array;
