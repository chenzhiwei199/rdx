import React from 'react';
import ReactJson from 'react-json-view';
export default {
  title: '场景专题/嵌套数据转换',
  parameters: {
    info: { inline: true },
  },
};
const treeData = [{
  label: '服装',
  value: '1',
  children: [{
      label: '男装',
      value: '2',
      children: [{
          label: '外套',
          value: '4'
      }, {
          label: '夹克',
          value: '5'
      }]
  }, {
      label: '女装',
      value: '3',
      children: [{
          label: '裙子',
          value: '6'
      }]
  }]
}];
function calcLeafCheck2Parent(dataSource = [], values:string[]) {
  const valueSet = new Set(values)
  const wrapperData = {
    children: dataSource
  }
  function dfs() {

  }
}

export const 嵌套数据转换  = () => {
  return <div>
    <ReactJson src={treeData}></ReactJson>
    <div>
      <strong>根据叶子节点数据，推导上层数据选中情况</strong>
    </div>
  </div>
}