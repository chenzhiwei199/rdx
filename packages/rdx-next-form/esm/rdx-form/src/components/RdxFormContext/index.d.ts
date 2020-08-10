import React from 'react';
export interface IRdxFormContext {
    children: React.ReactNode;
    state?: any;
    initializeState?: any;
    onChange?: (state: any) => void;
}
declare const RdxFormContext: (props: IRdxFormContext) => JSX.Element;
export default RdxFormContext;
