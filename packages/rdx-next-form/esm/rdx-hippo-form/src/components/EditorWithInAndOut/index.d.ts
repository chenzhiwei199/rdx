import React from 'react';
import { IEditorWithInAndOut } from './types';
export default class EditorWithInAndOut extends React.Component<IEditorWithInAndOut, {
    value: string;
    visible: boolean;
}> {
    constructor(props: any);
    getStateFromProps(props: any): {
        value: any;
    };
    componentDidMount(): void;
    execute: () => {
        message: string;
    };
    onChange: () => void;
    getData: () => any;
    updateCode: (code: any) => void;
    renderEditor(): JSX.Element;
    renderPreview(): JSX.Element;
    renderDialog(): JSX.Element;
    renderBase(): JSX.Element;
    onCancel: () => void;
    render(): JSX.Element;
}
export declare function Empty(props: {
    children: React.ReactNode;
}): JSX.Element;
