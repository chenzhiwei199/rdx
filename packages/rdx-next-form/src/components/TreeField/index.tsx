import React, { useContext, useRef, useState } from 'react';
import 'react-sortable-tree/style.css';
import {
  PathContextInstance,
  createArrayMutators,
  FormContextInstance,
  RdxFormContext,
  useFormId,
  get,
  set,
  BaseType,
  getChlidFieldInfo,
  RenderPerRow,
} from '@czwcode/rdx-form';
import styled from 'styled-components';
import Tree from 'react-sortable-tree';
import { IArray } from '../ArrayTableField';
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
    style,
    renderTitle = (data) => data[props.titleKey || 'id'],
  } = props;
  const id = useFormId();
  const [active, setActive] = useState<number[]>([]);
  const activePathWithChildren  =active.map((item, index) => {
    if (index === active.length - 1) {
      return item;
    } else {
      return item + '.children';
    }
  })
  const currentPaths = [
    id,
    ...activePathWithChildren,
  ] as string[];
  const { add } = createArrayMutators(onChange, children);
  const customTree = new CustomSymbolTree(value);
  const newLayout = customTree.map((node, paths, index) => {
    const isActive = paths.join('.') === active.join('.');
    return {
      paths,
      index,
      memeroyNode: node,
      title: () => {
        return (
          <div
            style={{
              border: `1px solid ${isActive ? '#23a3ff' : ' #bbb'}`,
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
  console.log('path', active, currentPaths);
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
        onMoveNode={(data) => {
          // const preIndex = [ data.node.paths].join('.');
          // const parentPaths = data.nextParentNode
          //   ? data.nextParentNode.paths
          //   : [];
          // const lastIndex = (data.nextParentNode
          //   ? data.nextParentNode.children
          //   : (data.treeData as any)
          // ).findIndex(
          //   (item) => item.memeroyNode.id === data.node.memeroyNode.id
          // );
          // const nextIndex = [...parentPaths, lastIndex].join(
          //   '.'
          // );
          // setActive([])
          // moveItem(preIndex, nextIndex);
          // console.log('data', data, preIndex, nextIndex);
          // onChange(tempData.current);
          // switchItem()
        }}
        onChange={(value) => {
          onChange(
            new CustomSymbolTree(value as any).map((item) => item.memeroyNode)
          );
        }}
        getNodeKey={({ node }) => node.paths.join('.') + '-' + node.index}
        treeData={newLayout}
      />
      {active.length > 0 && (
        <RenderPerRow children={children} rowIndex={activePathWithChildren.join('.')} />
        // <div style={{ flex: 1 }}>
        //   <RdxFormContext
        //     key={active.join('.')}
        //     initializeState={get(value, activePathWithChildren.join('.'))}
        //     onChange={(v) => {
        //       const { name = '' } = getChlidFieldInfo(children)
        //       onChange(set(JSON.parse(JSON.stringify(value)), activePathWithChildren.join('.'), v[name]));
        //     }}
        //   >
        //     <PathContextInstance.Provider
        //       value={{
        //         paths: [],
        //       }}
        //     >
        //       {children}
        //     </PathContextInstance.Provider>
        //   </RdxFormContext>
        // </div>
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
