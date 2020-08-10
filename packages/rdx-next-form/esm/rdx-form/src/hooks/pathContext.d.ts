import React from 'react';
import { IFieldDefine } from '../global';
export declare const PathContextInstance: React.Context<{
    paths: string[];
    setArrayItem?: (value: IFieldDefine) => void;
    isArray?: boolean;
    virtual?: boolean;
    mutators?: IMutator;
}>;
export interface IMutator {
    push: () => void;
    change: (index: any, key: string, v: any) => void;
}
export declare const createMutators: (value: any, onChange: any, index: any, defaultValue?: any) => {
    push: () => void;
    change: (index: any, key: string, v: any) => void;
};
