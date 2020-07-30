export interface IFieldDefine {
  xComponent?: string;
  type?: string;
  name?: string
  title?: string
  desc?: string
  default?: any
}

export enum BaseType {
  Object  = 'object',
  Array  = 'array',
  String  = 'string',
  Number  = 'number',
  Boolean  = 'boolean',
}


