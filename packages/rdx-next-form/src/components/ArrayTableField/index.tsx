import React, { useContext } from 'react';
import { PathContextInstance, getChlidFieldInfo } from '@czwcode/rdx-form';
import styled from 'styled-components';
import { Table, Icon, Button } from '@alifd/next';
import { createMutators } from '../../utils/array';
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

const Array = (props: IArray) => {
  const { value = [], onChange, children, name } = props;
  const { paths: parentPaths = [] } = useContext(PathContextInstance);
  const infos = getChlidFieldInfo(children);
  const { children: childrenInfos = [] } = infos;
  const { remove, moveDown, moveUp, add } = createMutators(
    value,
    onChange,
    infos
  );
  return (
    <StyleCard>
      {/* tslint:disable */}
      <Table
        dataSource={JSON.parse(JSON.stringify(value))}
        columns={[
          ...childrenInfos.map((item, colIndex) => ({
            dataIndex: item.xComponent,
            title: item.title,
            cell: (value, rowIndex) => {
              const currentPaths = [...parentPaths, name, rowIndex.toString()];
              return (
                <PathContextInstance.Provider
                  value={{
                    paths: currentPaths,
                  }}
                >
                  {React.cloneElement(item.child, {
                    ...item.child.props,
                    title: undefined,
                    key: `${rowIndex}-${item.name}`,
                  })}
                </PathContextInstance.Provider>
              );
            },
          })),
          {
            dataIndex: '____operation',
            title: '操作',
            cell: (v, index) => {
              const ReDefineButton = Button as any;
              // @ts-ignore
              return (
                <div style={{ display: 'flex' }}>
                  <ReDefineButton type='primary'>
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
                </div>
              );
            },
          },
        ]}
        {...({} as any)}
      ></Table>
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
export default Array;
