import { registryRdxFormComponents } from '@czwcode/rdx-form';
import React from 'react';
export * from '@czwcode/rdx-form';
export * from './components';
import ArrayTableField from './components/ArrayTableField';
// import JsonView from './components/JsonViewField';
import { Input, Select, Radio, Switch, Checkbox } from '@alifd/next';
import EditorWithInAndOut from './components/EditorWithInAndOut';
// import JsonEditor from './components/JsonEditor';
// import TreeField from './components/TreeField';
// import ColorPicker from './components/ColorPicker';
export function setup() {
  registryRdxFormComponents({
    string: Input,
    arrayTable: ArrayTableField,
    select: Select,
    radio: Radio.Group,
    boolean: Switch,
    checkbox: (props) => {
      const { value, onChange, ...rest } = props;
      return <Checkbox checked={value} onChange={onChange} {...rest} />;
    },
    // color: ColorPicker,
    // json: JsonView,
    // tree: TreeField,
    // jsonEditor: JsonEditor,
    // code: EditorWithInAndOut,
  });
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
}
