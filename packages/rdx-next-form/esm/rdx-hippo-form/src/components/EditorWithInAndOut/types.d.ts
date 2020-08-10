/// <reference types="react" />
export interface IEditorWithInAndOut {
    value: string;
    placeholder?: string;
    title?: string;
    src: any;
    isDialog: boolean;
    trigger: React.ReactNode;
    onChange?: (v: string) => void;
    onCancel?: () => void;
    execute: (data: any, value: string) => any;
    srcFormatter: (src: any, value: string) => any;
    loading?: boolean;
    error?: boolean;
}
