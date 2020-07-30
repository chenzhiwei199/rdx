import React, { useContext, useRef, useState } from 'react';
import 'react-sortable-tree/style.css';
import {
  PathContextInstance,
  getChlidFieldInfo,
  renderChildren,
} from '@czwcode/rdx-form';
import styled from 'styled-components';
import Tree from 'react-sortable-tree';
import { IArray } from '../ArrayTableField';
import { createMutators } from '../../utils/array';
import { Icon } from '@alifd/next';
import CustomSymbolTree from './treeCore';
export interface ITreeField extends IArray {
  titleKey?: string;
  trigger: React.ReactNode;
  style?: React.CSSProperties;
  renderTitle: (record) => React.ReactNode;
  canNodeHaveChildren: (value) => boolean;
}

export interface IArrayItem {
  name: string;
  value: any;
  paths: string[];
  children: React.ReactNode;
}

const TreeField = (props: ITreeField) => {
  const {
    value = [],
    onChange,
    children,
    name,
    style,
    renderTitle = (data) => data[props.titleKey || 'id'],
  } = props;
  const { paths: parentPaths = [] } = useContext(PathContextInstance);
  const [active, setActive] = useState<number[]>([]);
  const infos = getChlidFieldInfo(children);
  const currentPaths = [
    ...parentPaths,
    name,
    ...active.map((item, index) => {
      if (index === active.length - 1) {
        return item;
      } else {
        return item + '.children';
      }
    }),
  ] as string[];
  const { add } = createMutators(value, onChange, infos);
  const customTree = new CustomSymbolTree(value);
  const newLayout = customTree.map((node, paths, index) => {
    return {
      paths,
      index,
      memeroyNode: node,
      title: () => {
        return (
          <div
            style={{
              display: 'flex',
              width: '100%',
              height: '100%',
              justifyItems: 'space-between',
              padding: '0px 6px',
            }}
          >
            <div
              onClick={() => {
                setActive(paths);
              }}
            >
              {renderTitle(node)}
            </div>
            <Icon
              onClick={(e) => {
                // onDelete(field.code);
                onChange(customTree.remove(paths));
                e.preventDefault();
                e.stopPropagation();
              }}
              size='xs'
              style={{ marginLeft: 12, color: 'lightgrey', opacity: 0.7 }}
              type='close'
            ></Icon>
          </div>
        );
      },
      expanded: true,
    };
  });
  return (
    <StyleTree style={style}>
      <StyledAdd
        onClick={() => {
          add();
        }}
      >
        <Icon type='add' />
      </StyledAdd>
      <Tree
        style={{ flex: 1, height: '100%', overflow: 'auto' }}
        onChange={(value) => {
          onChange(
            new CustomSymbolTree(value as any).map((item) => item.memeroyNode)
          );
        }}
        getNodeKey={({ node }) => node.paths.join('.') + '-' + node.index}
        treeData={newLayout}
      />
      {active.length > 0 && (
        <div style={{ flex: 1 }}>
          <PathContextInstance.Provider
            key={active.join('.')}
            value={{
              paths: currentPaths,
            }}
          >
            {renderChildren(infos, children)}
          </PathContextInstance.Provider>
        </div>
      )}
    </StyleTree>
  );
};

const StyleEmpty = styled.div`
  display: flex;
  flex-direction: center;
  align-items: center;
  justify-content: center;
`;
const StyleTree = styled.div`
  box-shadow: none;
  border-width: 1px;
  height: 400px;
  border-style: solid;
  border-color: rgb(238, 238, 238);
  border-image: initial;
  display: flex;
`;
const StyledAdd = styled.div`
  padding: 10px;
  background: rgb(251, 251, 251);
  border-left: 1px solid rgb(220, 222, 227);
  border-right: 1px solid rgb(220, 222, 227);
  border-bottom: 1px solid rgb(220, 222, 227);
`;
export default TreeField;
