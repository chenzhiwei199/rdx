import React, { useRef, useEffect, useMemo, useState } from 'react';
import { VariableSizeList } from 'react-window';
import { useForceUpdate } from '../../../../packages/rdx/src/hooks/hookUtils';
import { Button } from '@alifd/next';
export default {
  title: '场景专题/动态高度虚拟滚动',
  parameters: {
    info: { inline: true },
  },
};

const rowHeights = new Array(1000)
  .fill(true)
  .map(() => 25 + Math.round(Math.random() * 50));

const getItemSize = (index) => 20;

export const 虚拟列表 = () => {
  const domRectRef = useRef(new Map<number, HTMLDivElement>());
  const heightRef = useRef(new Map<number, number>());
  const forceUpdate = useForceUpdate();
  const addObserver = (node: HTMLElement & { mutationObserver: MutationObserver | null}, index: number) => {
    if(!node.mutationObserver) {
      // 上一次的高度
      let recordHeight = node.getBoundingClientRect().height;
      node.mutationObserver = new MutationObserver(function() {
        // 新高度
        let height = node.getBoundingClientRect().height;
        if (recordHeight === height) {
          return;
        }
        recordHeight = height;
        // handleCalculatePosition(node, index, true);
      });
  
      node.mutationObserver.observe(node, {
        childList: true, // 子节点的变动（新增、删除或者更改）
        attributes: true, // 属性的变动
        characterData: true, // 节点内容或节点文本的变动
        subtree: true // 是否将观察器应用于该节点的所有后代节点
      });
    }
  }
  useEffect(() => {
    for (let item of domRectRef.current.entries()) {
      heightRef.current.set(item[0], item[1].getBoundingClientRect().height);
      addObserver(item[1] as any, item[0])
    }
    console.log(2222, heightRef.current);
    forceUpdate();
  }, []);
  const Row = ({ index, style }) => {
    return (
      <div
        ref={(ref) => {
          domRectRef.current.set(index, ref);
        }}
        style={{
          height: rowHeights[index],
          background: index % 2 === 0 ? 'white' : 'grey',
        }}
      >
        {index}
      </div>
    );
  };

  
  return (
    <VariableSizeList
      height={200}
      // estimatedItemSize={}
      width={300}
      itemSize={(index) => {
        return heightRef.current.get(index) || 40;
      }}
      itemCount={rowHeights.length}
    >
      {Row}
    </VariableSizeList>
  );
};

const data = [{ key: 1 }, { key: 2 }, { key: 3 }];
export const Test = () => {
  const [state, setState] = useState(data);
  return (
    <div>
      <Button
        onClick={() => {
          setState([{key: 4}, ...state]);
        }}
      >
        更新数据
      </Button>
      <div style={{ overflow: 'auto', background: 'lightgrey', height: 300 }}>
        {state.map((item) => {
          return (
            <div key={item.key} style={{ height: 150 }}>
              {item.key}
            </div>
          );
        })}
      </div>
    </div>
  );
};
