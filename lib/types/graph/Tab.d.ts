import * as React from 'react';
interface ITab {
    dataSource: {
        label: string;
        children?: any[];
        value: string;
    }[];
    active?: string;
    defaultActive?: string;
    onChange?: () => void;
    children?: (v: string, row: {
        label: string;
        value: string;
        children?: any[];
    }) => React.ReactNode;
}
declare const Tab: (props: ITab) => JSX.Element;
export default Tab;
