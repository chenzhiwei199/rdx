import React from 'react';
export interface IObjectItem {
    name: string;
    paths?: string[];
    children: React.ReactNode;
}
declare const ObjectField: (props: IObjectItem) => JSX.Element;
export default ObjectField;
