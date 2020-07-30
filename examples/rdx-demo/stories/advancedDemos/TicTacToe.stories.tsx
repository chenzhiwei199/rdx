import React, { useCallback } from 'react';
import { RdxContext, Status, RdxView, DataContext } from '@czwcode/rdx';
import { useState } from 'react';
import ReactJson from 'react-json-view';
export default {
  title: '场景示例|点对点更新|棋盘',
  parameters: {
    info: { inline: true },
  },
};
const size = 20;
const cellStyle = {
  textAlign: 'center',
  width: '20px',
  height: '20px',
  minWidth: '20px',
  minHeight: '20px',
  lineHeight: '20px',
  border: '1px solid black',
};
const rowStyle = {
  display: 'flex',
  flexDirection: 'row',
};

const Cell = (context: DataContext<any, any[], any>) => {
  const { value, next } = context;
  console.log('Cell render');
  return (
    <div
      style={cellStyle as any}
      onClick={() => {
        const randomContent = () => (Math.random() > 0.5 ? 'x' : '0');
        next(randomContent());
      }}
    >
      {value}
    </div>
  );
};

const storeModel = new Array(size).fill(new Array(size).fill(undefined));
const ShowDataView = (context: DataContext<any, any, any>) => {
  const { depsValues } = context;
  const depsIds = getDepsIds();
  let data = [];
  depsIds.forEach((item, index) => {
    const [rowIndex, cellIndex] = item.id.split('-');
    if (data[rowIndex]) {
      data[rowIndex][cellIndex] = depsValues[index];
    } else {
      data[rowIndex] = [depsValues[index]];
    }
  });
  return <ReactJson src={data} />;
};
const getDepsIds = () => {
  const datas = [];
  storeModel.forEach((row, rowIndex) => {
    row.forEach((cell, cellIndex) => {
      datas.push({ id: `${rowIndex}-${cellIndex}` });
    });
  });
  return datas;
};
export const 井字游戏 = () => {
  return (
    <div className='todoapp'>
      <h2>分布式数据管理，避免了组件的交叉渲染，大大调高了交互的体验</h2>
      <div>
        <strong>对比效果图</strong>
        <br />
        <img
          width={'600px'}
          src='https://img.alicdn.com/tfs/TB1gM4ePUY1gK0jSZFCXXcwqXXa-839-491.gif'
        />
      </div>
      <div style={{ display: 'flex' }}>
        <div>
          <RdxContext>
            <h2>1.Rdx实现的棋盘</h2>
            {storeModel.map((row, rowI) => {
              return (
                <div key={rowI} style={rowStyle as any}>
                  {row.map((cell, cellI) => {
                    return (
                      <RdxView
                        recordStatus={false}
                        id={`${rowI}-${cellI}`}
                        render={Cell}
                      ></RdxView>
                    );
                  })}
                </div>
              );
            })}
            {/* <RdxView
          id={'show data'}
          recordStatus={false}
          deps={getDepsIds()}
          render={ShowDataView}
        /> */}
            {/* <DevVisualGraphTool />
        <DevVisualGraphTool /> */}
          </RdxContext>
        </div>
        <div style={{ marginLeft: 20 }}>
          <h2>2.普通的棋盘</h2>
          <Ordinary />
        </div>
      </div>
    </div>
  );
};

const CellForCommon = ({ content, onClick }) => {
  return (
    <div style={cellStyle as any} onClick={onClick}>
      {content}
    </div>
  );
};
const Ordinary = () => {
  const [state, setState] = useState(storeModel);
  const click = useCallback((rowIndex, colIndex) => {
    const randomContent = () => (Math.random() > 0.5 ? 'x' : '0');
    setState((state) => [
      ...state.slice(0, rowIndex),
      [
        ...state[rowIndex].slice(0, colIndex),
        randomContent(),
        ...state[rowIndex].slice(colIndex + 1),
      ],
      ...state.slice(rowIndex + 1),
    ]);
  }, []);
  return (
    <div>
      {state.map((row, rowIndex) => {
        return (
          <div style={rowStyle as any}>
            {row.map((col, colIndex) => {
              return (
                <CellForCommon
                  content={state[rowIndex][colIndex]}
                  onClick={() => {
                    click(rowIndex, colIndex);
                  }}
                />
              );
            })}
          </div>
        );
      })}
      {/* <ReactJson src={state} /> */}
    </div>
  );
};
