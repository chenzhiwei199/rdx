import {
  RdxFormItem,
  IRdxFormItem,
  registryRdxFormComponents,
  BaseType,
} from '@czwcode/rdx-form';
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
export * from './components/SearchList';
export * from './components/FormItemGrid';
import EditorWithInAndOut from './components/EditorWithInAndOut';
import JsonEditor from './components/JsonEditor';
import TreeField from './components/TreeField';
import ColorPicker from './components/ColorPicker';
import { InputProps } from '@alifd/next/types/input';
import { NumberPickerProps } from '@alifd/next/types/number-picker';
import { SwitchProps } from '@alifd/next/types/switch';
import { SelectProps } from '@alifd/next/types/select';
import { RadioProps } from '@alifd/next/types/radio';
import { CheckboxProps } from '@alifd/next/types/checkbox';
import { DatePickerProps } from '@alifd/next/types/date-picker';
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

export interface IRdxNextFormItem<
  ISource,
  GBaseType extends BaseType,
  GXComponentType extends XComponentType
> extends IRdxFormItem<ISource, GBaseType> {
  xComponent?: GXComponentType;
  componentProps?: inferComponentProps<GBaseType, GXComponentType>;
}
type inferComponentProps<GBaseType, GXComponentType> = GXComponentType extends keyof NextComponentProps
? NextComponentProps[GXComponentType]
: GBaseType extends keyof BaseNextProps
? BaseNextProps[GBaseType]
: any

export const RdxNextFormItem = <
  ISource,
  GBaseType extends BaseType,
  GXComponentType extends XComponentType
>(
  props: IRdxNextFormItem<ISource, GBaseType, GXComponentType>
) => {
  return <RdxFormItem {...props} />;
};
export interface BaseNextProps {
  string: InputProps;
  number: NumberPickerProps;
  boolean: SwitchProps;
}

export interface NextComponentProps {
  select: SelectProps;
  radio: RadioProps
  checkbox: CheckboxProps
  time: DatePickerProps
  [key: string]: any
}

interface XComponentTypeMap {
  select: 'string';
  radio: 'string';
  checkbox: 'string';
  color: 'string';
  json: 'string';
  jsonEditor: 'string';
  code: 'string';
  arrayTable: 'string';
  tree: 'string';
  time: 'string';
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
