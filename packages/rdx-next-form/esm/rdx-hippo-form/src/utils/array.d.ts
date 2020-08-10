import { IFieldDefine } from '@czwcode/rdx-form';
export declare function createMutators(value: any, onChange: any, infos: IFieldDefine): {
    add: () => void;
    moveDown: (index: any) => void;
    moveUp: (index: any) => void;
    remove: (index: any) => void;
    switchItem: (arr: any[], preIndex: number, nextIndex: number) => any[];
};
