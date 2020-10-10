import { IFieldDefineWithChild, getChlidFieldInfo, IFieldInfo } from './functions';
import { IFieldDefine } from '../global';
import React, { useContext } from 'react';
import { FormContextInstance } from '../hooks/formContext';
import { PathContextInstance } from '../hooks/pathContext';
import { useFormId } from '../components';

function renderBasic(
  children,
  rowIndex,
  processProps?: () => { [key: string]: any }
) {
  const { paths = [] } = useContext(PathContextInstance);
  const { name } = useContext(FormContextInstance);
  return (
    <PathContextInstance.Provider
      value={{
        paths: [...paths, name],
      }}
    >
      {React.cloneElement(children, {
        ...(processProps && processProps()),
        name: rowIndex,
      })}
    </PathContextInstance.Provider>
  );
}
function RenderObject({
  children,
  rowIndex,
  colIndex,
  processProps,
}: {
  children: React.ReactNode;
  rowIndex: number;
  colIndex: number;
  processProps?: () => { [key: string]: any };
}) {
  const field: IFieldInfo = getChlidFieldInfo(children);
  const { children: childrenInfo } = field;
  const id = useFormId();
  return (
    <>
      <PathContextInstance.Provider
        value={{
          paths: [id, rowIndex.toString()],
        }}
      >
        {React.cloneElement(childrenInfo[colIndex].child, {
          key: rowIndex,
          ...(processProps && processProps()),
        })}
      </PathContextInstance.Provider>
    </>
  ) as any;
}

export function RenderPerRow({ children, rowIndex }) {
  const field: IFieldInfo = getChlidFieldInfo(children);
  const id = useFormId()
  let currentChildren = <></>;
  if (field.type === 'object') {
    currentChildren = (
      <PathContextInstance.Provider
        value={{
          paths: [id, rowIndex.toString()],
        }}
      >
        {field.childrenReactNode}
      </PathContextInstance.Provider>
    );
  } else {
    currentChildren = renderBasic(children, rowIndex);
  }
  return currentChildren;
}
export function RenderPerCell({
  children,
  rowIndex,
  colIndex,
  processProps,
}: {
  children: React.ReactNode;
  rowIndex: number;
  colIndex: number;
  processProps?: () => { [key: string]: any };
}) {
  const field: IFieldDefine & {
    children?: IFieldDefineWithChild[];
  } = getChlidFieldInfo(children);
  let currentChildren = <></>;
  if (field.type === 'object') {
    currentChildren = (
      <RenderObject
        key={rowIndex}
        {...{
          children,
          rowIndex,
          colIndex,
          processProps,
        }}
      />
    );
  } else {
    currentChildren = renderBasic(children, rowIndex, processProps);
  }
  return currentChildren;
}
