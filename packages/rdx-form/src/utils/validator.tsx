import { isEmpty } from "./isEmpty";

export function getVaildErrors(errors: string[] = []) {
  return errors.filter((error) => !isEmpty(error));
}
export function isError(errors: string[]) {
  return getVaildErrors(errors).length > 0
}