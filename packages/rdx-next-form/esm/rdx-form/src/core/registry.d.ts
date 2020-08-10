import { IFromItemBase } from "../components";
export declare const getRegistry: () => {
    fields: {};
};
export declare const cleanRegistry: () => void;
export interface IRdxFormComponent {
    value: any;
    onChange: any;
}
export declare function registryRdxFormComponent(key: string, component: IFromItemBase<any>): void;
export declare function registryRdxFormComponents(components: {
    [key: string]: any;
}): void;
