import React from 'react';
import { RdxContext, RdxView, DataContext } from '@czwcode/rdx';
import { Table, Input, Select } from '@alifd/next';
import { produce } from 'immer';
import { useState } from 'react';
import { useCallback } from 'react';
export default {
  title: '场景示例/点对点更新/可编辑的表格',
  parameters: {
    info: { inline: true },
  },
};

function createResult() {
  const size = 20;
  let result = [];
  for (let index = 0; index < size; index++) {
    result.push({
      title: '标题' + index,
      time: index,
      id: '名称' + index,
      title1: '名称' + index,
      title2: '名称' + index,
      title3: '名称' + index,
      title4: '名称' + index,
      title5: '名称' + index,
      title6: '名称' + index,
      title7: '名称' + index,
      title8: '名称' + index,
      title9: '名称' + index,
      title10: '名称' + index,
    });
  }
  return result;
}
const result = createResult();
function createDataSource() {
  let size = 100;
  const data = [];
  for (let index = 0; index < size; index++) {
    data.push({
      label: '测试文本' + index,
      value: index + '',
    });
  }
  return data;
}
const dataSource = createDataSource();
const EditablePane = (props: { value: any; onChange: any }) => {
  const { value, onChange } = props;
  return <Select value={value} dataSource={dataSource} onChange={onChange} />;
};

export const 可编辑表格_普通版本 = () => {
  const [state, setState] = useState(result);
  const renderCell = useCallback((dataIndex, value, index, record) => {
    return (
      <EditablePane
        value={value}
        onChange={(value) => {
          setState((state) =>
            produce(state, (dataSource) => {
              dataSource[index][dataIndex] = value;
            })
          );
        }}
      />
    );
  }, []);
  return (
    <div>
      <Table dataSource={state}>
        <Table.Column
          cell={renderCell.bind(null, 'time')}
          title='Time'
          dataIndex='time'
        />
        <Table.Column
          title='Title'
          dataIndex='title'
          cell={renderCell.bind(null, 'title')}
        />
        <Table.Column
          title='Title'
          dataIndex='title1'
          cell={renderCell.bind(null, 'title1')}
        />
        <Table.Column
          title='Title'
          dataIndex='titl2'
          cell={renderCell.bind(null, 'titl2')}
        />
        <Table.Column
          title='Title'
          dataIndex='tite3'
          cell={renderCell.bind(null, 'tite3')}
        />
      </Table>
    </div>
  );
};
const view = (context: DataContext<any, any>) => {
  const { value, next } = context;
  return (
    <EditablePane
      value={value}
      onChange={(value) => {
        next(value);
      }}
    />
  );
};

const getResult = () => {
  const datas = {};
  result.forEach((row, rowIndex) => {
    columns.forEach((column) => {
      datas[`${column}-${rowIndex}`] = '名称' + rowIndex;
    });
  });
  return datas;
};
const columns = ['time', 'title', 'title1', 'title2', 'title3'];
const resultData = getResult();
export const 可编辑表格_Rdx版本 = () => {
  const renderCell = useCallback((dataIndex, value, index, record) => {
    return (
      <RdxView
        recordStatus={false}
        id={`${dataIndex}-${index}`}
        render={view}
      ></RdxView>
    );
  }, []);
  return (
    <RdxContext state={resultData}>
      <Table dataSource={result}>
        {columns.map((column) => (
          <Table.Column
            cell={renderCell.bind(null, column)}
            title={column}
            dataIndex={column}
          />
        ))}
      </Table>
    </RdxContext>
  );
};
