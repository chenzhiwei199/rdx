/// <reference types="react" />
export interface ErrorContext {
    errors?: {
        [key: string]: string[];
    };
}
export declare class ErrorContextClass implements ErrorContext {
    errors: {};
    setErrors(key: string, errors: string[]): void;
    getErrors(key: string): any;
}
export declare const ErrorContextInstance: import("react").Context<ErrorContextClass>;
