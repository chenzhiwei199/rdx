import { RdxFormItem, IRdxFormItem, registryRdxFormComponents, BaseType } from '@czwcode/rdx-form';
import React from 'react';
export * from '@czwcode/rdx-form';
export * from './components';
import ArrayTableField from './components/ArrayTableField';
import JsonView from './components/JsonViewField';
import {
  Input,
  Select,
  NumberPicker,
  Radio,
  Switch,
  Checkbox,
  DatePicker,
} from '@alifd/next';
export * from './components/SearchList'
export * from './components/FormItemGrid'
import EditorWithInAndOut from './components/EditorWithInAndOut';
import JsonEditor from './components/JsonEditor';
import TreeField from './components/TreeField';
import ColorPicker from './components/ColorPicker';
import { InputProps } from '@alifd/next/types/input';
import { NumberPickerProps } from '@alifd/next/types/number-picker';
import { SwitchProps } from '@alifd/next/types/switch';
export function setup() {
  registryRdxFormComponents({
    string: Input,
    arrayTable: ArrayTableField,
    select: Select,
    time: DatePicker,
    radio: Radio.Group,
    number: NumberPicker,
    boolean: Switch,
    checkbox: (props) => {
      const { value, onChange, ...rest } = props;
      return <Checkbox checked={value} onChange={onChange} {...rest} />;
    },
    color: ColorPicker,
    json: JsonView,
    tree: TreeField,
    jsonEditor: JsonEditor,
    code: EditorWithInAndOut,
  });
}

export interface IRdxNextFormItem<ISource , T extends BaseType> extends IRdxFormItem<ISource, T> {
  componentProps?: NextTypes[T]
}
export const RdxNextFormItem  = <ISource, GBaseType extends BaseType>(props: IRdxNextFormItem<ISource , GBaseType>) => {
  return <RdxFormItem {...props} />
} 
export interface NextTypes  {
  string: InputProps,
  number: NumberPickerProps,
  boolean: SwitchProps,
  [key: string]: any
}
export enum XComponentType {
  Select = 'select',
  Radio = 'radio',
  Checkbox = 'checkbox',
  Color = 'color',
  Json = 'json',
  JsonEditor = 'jsonEditor',
  Code = 'code',
  ArrayTable = 'arrayTable',
  Tree = 'tree',
  Time = 'time',
}
