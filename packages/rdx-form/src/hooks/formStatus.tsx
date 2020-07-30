import { createContext } from "react";

export interface ErrorContext {
 errors?: { [key: string]: string[]}
}

export class ErrorContextClass implements ErrorContext {
  errors = {}
  setErrors(key: string, errors: string[]) {
    this.errors[key] = errors
  }
  getErrors(key: string) {
    return this.errors[key]
  }
}
export  const ErrorContextInstance = createContext<ErrorContextClass>(new ErrorContextClass());
