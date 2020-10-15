import { createContext } from "react";
import { RuleDetail } from "../components";

export interface ErrorContext {
 rules?: { [key: string]: RuleDetail[]}
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
export  const GlobalErrorContextInstance = createContext<ErrorContextClass>(new ErrorContextClass());
