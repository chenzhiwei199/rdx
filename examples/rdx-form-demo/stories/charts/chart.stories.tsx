import React from 'react';
import { SchemaMarkupField, SchemaForm } from '@uform/next';
import { Button } from '@alifd/next';
import { useState } from 'react';
import SupplyChain, { INode } from './chart';
import { Select } from '@alifd/next';
export default {
  title: '基本示例/Chart',
  parameters: {
    info: { inline: true },
  },
};

function getRowIndex(index: number, colNumberInRow: number) {
  const positionIndex = index + 1;
  let rowNumber = Math.ceil(positionIndex / colNumberInRow) - 1;
  return rowNumber;
}
function getVirtualIndex(index: number, colNumberInRow: number) {
  let rowNumber = getRowIndex(index, colNumberInRow);
  const positionIndex = index + 1;
  const isEven = rowNumber % 2 === 0;
  let xDistance = 0;
  if (isEven) {
    xDistance = (positionIndex - 1) % colNumberInRow;
  } else {
    xDistance = colNumberInRow * (rowNumber + 1) - positionIndex;
  }
  return {
    row: rowNumber,
    xDistance,
  };
}
function getRealIndex(index: number, colNumberInRow: number) {
  let rowIndex = 0;
  if (index < colNumberInRow) {
    rowIndex = 0;
  } else {
    rowIndex = Math.ceil((index + 1 - colNumberInRow) / (colNumberInRow - 1));
  }
  Math.floor(index / colNumberInRow);
  return getVirtualIndex(index + rowIndex, colNumberInRow);
}
function createLayout(
  nodes: { id: any }[],
  options: {
    nodeConfig: { width: number; height: number };
    rowGap: number;
    colGap: number;
    rowNumber?: number;
  } = {} as any
): INode[] {
  const {
    colGap = 100,
    rowGap = 70,
    rowNumber: rowNumbers = 5,
    nodeConfig = {} as any,
  } = options;
  const { width = 200, height = 100 } = nodeConfig;

  let newNodes = [] as INode[];
  nodes.forEach((node, index) => {
    const { row, xDistance } = getRealIndex(index, rowNumbers);

    const x = xDistance * (width + colGap);
    const y = row * (height + rowGap);
    newNodes.push({ ...node, x: width / 2 + x, y: height / 2 + y });
  });
  return newNodes;
}
export const TestChart = () => {
  const newNodes = createLayout([
    { id: 1 },
    { id: 2 },
    { id: 3 },
    { id: 4 },
    { id: 5 },
    { id: 6 },
    { id: 7 },
    { id: 8 },
    { id: 9 },
    { id: 10 },
    { id: 11 },
    { id: 12 },
    { id: 13 },
    { id: 14 },
    { id: 15 },
    { id: 16 },
    { id: 17 },
    { id: 18 },
    { id: 19 },
  ]);
  console.log('newNodes: ', newNodes);
  return (
    <SupplyChain
      nodeConfig={{
        width: 200,
        height: 130,
      }}
      edgeConfig={{
        width: 62,
        height: 44,
        color: 'rgb(184,184,184)',
        extraWidth: 50,
      }}
      left={0}
      top={0}
      svgConfig={{
        width: 1500,
        height: 1000,
      }}
      edgeRender={(id) => {
        return (
          <div
            style={{
              display: 'flex',
              width: '100%',
              height: '100%',
              fontSize: 20,
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 20,
              background: 'rgb(184,184,184)'
            }}
          >{id}</div>
        );
      }}
      nodeRender={(id) => {
        return (
          <div
            style={{
              padding: '15px 0px',
              display: 'flex',
              width: '100%',
              height: '100%',
              fontSize: 20,
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: 40,
                width: 40,
                borderRadius: '50%',
                background: 'rgb(132,104,204)',
              }}
            >
              {id}
            </div>
            <strong>配送供应商</strong>
            <Select></Select>
          </div>
        );
      }}
      nodes={newNodes}
      edges={[
        { from: 1, to: 2, id: 'a' },
        { from: 2, to: 3, id: 'b' },
        { from: 3, to: 4, id: 'c' },
        { from: 4, to: 5, id: 'd' },
        { from: 5, to: 6, id: 'e' },
        { from: 6, to: 7, id: 'f' },
        { from: 7, to: 8, id: 'g' },
        { from: 8, to: 9, id: 'h' },
        { from: 9, to: 10, id: 'i' },
        { from: 10, to: 11, id: 'i' },
        { from: 11, to: 12, id: 'i' },
        { from: 12, to: 13, id: 'i' },
        { from: 13, to: 14, id: 'i' },
        { from: 14, to: 15, id: 'i' },
      ]}
    />
  );
};

// export const FormObjecySample = () => {
//   return <FromItem title='parent' type={'object'}>
//         <FromItem name='child' title='111' type={'string'}/>
//   </FromItem>
// }
