import React from 'react';
import { IFieldDefine } from '../global';
export const PathContextInstance = React.createContext<{
  paths: string[];
  setArrayItem?: (value: IFieldDefine) => void;
  isArray?: boolean;
  virtual?: boolean;
  mutators?: IMutator;
}>({
  paths: [],
  virtual: false,
  isArray: false,
  setArrayItem: () => {},
});

export interface IMutator {
  push: () => void;
  change: (index: any, key: string, v: any) => void;
}
export const createMutators = (value, onChange, index, defaultValue?: any) => ({
  push: () => {
    onChange(value.concat({}));
  },
  change: (index: any, key: string, v: any) => {
    onChange([
      ...value.slice(0, index),
      { ...value[index], [key]: v },
      ...value.slice(index + 1),
    ]);
  },
});
