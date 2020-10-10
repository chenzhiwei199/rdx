export interface IFieldDefine {
  xComponent?: string;
  type?: string;
  name?: string;
  title?: string;
  desc?: string;
  default?: any;
}

export enum BaseType2 {
  Object = 'object',
  Array = 'array',
  String = 'string',
  Number = 'number',
  Boolean = 'boolean',
  Any = 'any',
}
export type BaseType = keyof TypeMap;
export const BaseType = { ...BaseType2 };
export interface TypeMap {
  object: Object;
  string: string;
  array: Array<any>;
  number: number;
  boolean: boolean;
  any: any;
}

export type SuspectType<T extends BaseType> = TypeMap[T];
