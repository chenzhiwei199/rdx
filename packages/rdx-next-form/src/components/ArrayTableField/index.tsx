import React, { memo, useContext, useEffect, useMemo } from 'react';
import {
  PathContextInstance,
  getChlidFieldInfo,
  FormContextInstance,
  createArrayMutators,
  RenderPerCell,
  useRdxFormStateContext,
  BaseType,
} from '@czwcode/rdx-form';
import styled from 'styled-components';
import { Table, Icon, Button } from '@alifd/next';
import '@alifd/next/dist/next.css';

export interface IArray {
  value: any[];
  onChange: (v: any[]) => void;
  name: string;
  paths?: string[];
  children: React.ReactNode;
}

export interface IArrayItem {
  name: string;
  value: any;
  paths: string[];
  children: React.ReactNode;
}
const Cell = ({ children, rowIndex, colIndex }) => {
  useEffect(() => {
    return () => {
      console.log('unmount    dddd');
    };
  }, []);
  return (
    <RenderPerCell
      key={`${rowIndex}-${colIndex}`}
      children={children}
      rowIndex={rowIndex}
      colIndex={colIndex}
      processProps={() => ({ title: undefined })}
    />
  );
};

const ArrayTableField = (props: IArray) => {
  const { onChange, children } = props;
  const { paths = [] } = useContext(PathContextInstance);
  const { name } = useContext(FormContextInstance);
  const id = [...paths, name].join('.');
  const context = useRdxFormStateContext();
  const getValue = () => {
    return (
      (context.getTaskStateById(id) || ({} as any)).value || []
    );
  };
  const { remove, moveDown, moveUp, add } = createArrayMutators((v) => {
    onChange(v);
  }, children);
  const operateColumn = {
    dataIndex: '____operation',
    title: '操作',
    cell: (v, index) => {
      const ReDefineButton = Button as any;
      // @ts-ignore
      return (
        <ReDefineButton
          type='primary'
          // style={{ display: 'flex', justifyContent: 'space-around' }}
        >
          <Icon
            onClick={() => {
              remove(index);
            }}
            style={{ marginRight: 6 }}
            type='ashbin'
          ></Icon>
          <Icon
            onClick={() => {
              moveUp(index);
            }}
            style={{ marginRight: 6 }}
            type='arrow-up'
          ></Icon>
          <Icon
            onClick={() => {
              moveDown(index);
            }}
            type='arrow-down'
          ></Icon>
        </ReDefineButton>
      );
    },
  };
  const fieldInfo = getChlidFieldInfo(children);
  const columns =
    fieldInfo.type !== BaseType.Object
      ? [fieldInfo]
      : (fieldInfo.children as any);
  return (
    <StyleCard>
      <Table dataSource={getValue()}>
        {useMemo(() => {
          console.log('222, useMemo');
          return [
            ...columns.map((item, colIndex) => ({
              dataIndex: item.name,
              title: item.title,
              cell: (value, rowIndex) => {
                console.log('unmount    dddd', rowIndex, colIndex);
                return (
                  <Cell
                    key={`${rowIndex}-${colIndex}`}
                    children={children}
                    rowIndex={rowIndex}
                    colIndex={colIndex}
                  />
                );
              },
            })),
            operateColumn,
          ].map((item) => {
            return (
              <Table.Column
                key={item.dataIndex || item.title || 'default'}
                {...item}
              />
            );
          });
        }, [children])}
      </Table>
      <StyledAdd
        onClick={() => {
          add();
        }}
      >
        <Icon type='add' />
      </StyledAdd>
    </StyleCard>
  );
};

const StyleEmpty = styled.div`
  display: flex;
  flex-direction: center;
  align-items: center;
  justify-content: center;
`;
const StyleCard = styled.div`
  box-shadow: none;
  border-width: 1px;
  border-style: solid;
  border-color: rgb(238, 238, 238);
  border-image: initial;
`;
const StyledAdd = styled.div`
  padding: 10px;
  background: rgb(251, 251, 251);
  border-left: 1px solid rgb(220, 222, 227);
  border-right: 1px solid rgb(220, 222, 227);
  border-bottom: 1px solid rgb(220, 222, 227);
`;
export default ArrayTableField;
