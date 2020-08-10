import { ReactNode } from 'react';
import { DataContext, MixedTask, Status } from '@czwcode/rdx';
import { IFieldDefine } from '../../global';
export declare enum DepsType {
    Relative = "Relative",
    Absolute = "Absolute"
}
export interface IAtom {
    dataSource?: any[];
}
export declare type RuleDetail = (value: any, context: any) => Promise<string | undefined>;
export interface IFromItemBase<T> extends IFieldDefine {
    xProps?: Partial<T>;
    visible?: boolean;
    disabled?: boolean;
    dataSource?: any[];
    status?: Status;
    errorMsg?: string;
    formErrorMsg?: string[];
    require?: boolean;
    rules?: RuleDetail[];
}
export interface IModel {
    value?: any;
    dataSource?: any[];
    visible?: boolean;
    disabled?: boolean;
    xProps?: {
        [key: string]: any;
    };
}
export declare type IFromItem<T> = IFromItemBase<T> & {
    children?: ReactNode;
};
export declare type IRdxFormItem<T> = IFromItemBase<T> & {
    children?: ReactNode;
    deps?: {
        id: string;
        type?: DepsType;
    }[];
    firstRender?: boolean;
    reaction?: MixedTask<IModel, IModel[], IFromItemBase<T>>;
    defaultVisible?: boolean;
    defaultDisabled?: boolean;
    compute?: (value: any, context: DataContext<IModel, IModel[], IFromItemBase<T>>) => void;
    default?: any;
};
export declare function getDefaultValue(defaultValue: any, disabled?: boolean, dataSource?: any[]): {
    value: any;
    disabled: boolean;
    dataSource: any[];
};
export declare const RdxFormItem: <T extends Object>(props: IRdxFormItem<T>) => JSX.Element;
export declare const FromItem: <T extends Object>(props: IFromItem<T>) => JSX.Element;
