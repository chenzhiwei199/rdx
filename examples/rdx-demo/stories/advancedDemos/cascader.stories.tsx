import React from 'react';
import {
  RdxContext,
  RdxView,
  Status,
  ReactionContext,
  DataContext,
} from '@czwcode/rdx';
import { DevVisualGraphTool } from '@czwcode/rdx-plugins';
import '@alifd/next/dist/next.css';
import { Menu, Grid, Input, Select, Button } from '@alifd/next';
import axios from 'axios';
import { useCallback } from 'react';
import ReactJsonView from 'react-json-view';
export default {
  title: '场景示例/联动/Rdx版本',
  parameters: {
    info: { inline: true },
  },
};
import { province, city, area } from 'province-city-china/data';
import { useRef } from 'react';
const { Row, Col } = Grid;

export const 同步联动 = () => {
  interface TreeNode {
    label: string;
    value: string;
    children: TreeNode[];
  }
  interface TaskValue {
    chooseValue: string;
    dataSource: TreeNode[];
  }
  enum AdministrativeRegions {
    // 省
    Province = 'province',
    // 市
    City = 'city',
    // 区
    Area = 'area',
  }
  const provinceTask = useCallback(
    async (context: ReactionContext<TaskValue,any>) => {
      const { value, updateState: udpateState } = context;
      const res = await axios.get(
        'https://os.alipayobjects.com/rmsportal/ODDwqcDFTLAguOvWEolX.json'
      );
      udpateState({
        ...value,
        dataSource: res.data,
      });
    },
    []
  );
  const provinceView = useCallback(
    (context: DataContext<TaskValue,any>) => {
      const { next, next: updateState, value, status } = context;
      if (status === Status.FirstRender) {
        return '空白状态';
      }
      if (status === Status.Waiting) {
        return '加载状态';
      }
      if (status === Status.Error) {
        return '错误状态';
      }
      const { dataSource, chooseValue } = value;

      return (
        <Menu
          onItemClick={(key) => {
            next({
              ...value,
              chooseValue: key,
            });
          }}
          selectMode={'single'}
          selectedKeys={chooseValue}
          style={{ width: 100 }}
        >
          {dataSource.map((item) => (
            <Menu.Item key={item.value}>{item.label}</Menu.Item>
          ))}
        </Menu>
      );
    },
    []
  );
  const otherTask = useCallback(
    async (context: ReactionContext<TaskValue,any>) => {
      const { updateState: udpateState, value, depsValues } = context;
      const [preLevelValue = {}] = depsValues;
      const { dataSource = [], chooseValue } = preLevelValue;
      udpateState({
        ...value,
        dataSource: dataSource.find((item) => item.value === chooseValue)
          ?.children,
      });
    },
    []
  );
  const otherDefines = [
    {
      key: AdministrativeRegions.City,
      relyTaskKey: AdministrativeRegions.Province,
    },
    {
      key: AdministrativeRegions.Area,
      relyTaskKey: AdministrativeRegions.City,
    },
  ];

  const otherTaskView = (context: DataContext<TaskValue,any>) => {
    const { next: updateState, next, value, status } = context;
    if (status === Status.FirstRender) {
      return '空白状态';
    }
    if (status === Status.Waiting) {
      return '加载状态';
    }
    if (status === Status.Error) {
      return '错误状态';
    }
    const { dataSource, chooseValue } = value;
    if (!dataSource) {
      return '';
    }
    return (
      <Menu
        onItemClick={(key) => {
          next({
            ...value,
            chooseValue: key,
          });
        }}
        selectMode={'single'}
        selectedKeys={chooseValue}
        style={{ width: 100 }}
      >
        {dataSource.map((item) => (
          <Menu.Item key={item.value}>{item.label}</Menu.Item>
        ))}
      </Menu>
    );
  };
  return (
    <RdxContext onChange={() => {}}>
      <Row>
        <Col>
          <RdxView<TaskValue, any,any>
            id={AdministrativeRegions.Province}
            defaultValue={{ dataSource: [], chooseValue: '' }}
            reaction={provinceTask}
            render={provinceView}
          ></RdxView>
        </Col>
        {otherDefines.map((item) => (
          <Col>
            <RdxView<TaskValue, any,any>
              id={item.key}
              deps={[{ id: item.relyTaskKey }]}
              defaultValue={{ dataSource: [], chooseValue: '' }}
              reaction={otherTask}
              render={otherTaskView}
            ></RdxView>
          </Col>
        ))}
      </Row>
      <DevVisualGraphTool />
    </RdxContext>
  );
};
/**
 *
 *
 * @interface Model
 */
interface Model {
  dataSource: { label: string; value: string }[];
  value: string;
}

const pause = (t: number) => new Promise((resolve) => setTimeout(resolve, t));
const produceTask = (
  data: any[],
  filter: (v: any, depsValues: Model[]) => boolean,
  formatter: (data: any[]) => { label: string; value: string }[]
) => async (context: ReactionContext<Model,any>) => {
  const { value, depsValues, updateState: udpateState } = context;
  const newData = data.filter((value) => {
    const bool = filter(value, depsValues);
    return bool;
  });
  const newDataSource = formatter(newData);
  await pause(2000);
  udpateState({
    ...value,
    value: newDataSource[0] && newDataSource[0].value,
    dataSource: newDataSource,
  });
};
const countryTask = produceTask(
  province,
  (relyValues) => {
    return true;
  },
  (data) => {
    return data.map((item) => ({ label: item.name, value: item.province }));
  }
);
const regionTask = produceTask(
  city,
  (v, depsValues) => {
    const [province] = depsValues;
    return v.province === province.value;
  },
  (data) => {
    return data.map((item) => ({ label: item.name, value: item.city }));
  }
);
const cityTask = produceTask(
  area,
  (v, depsValues) => {
    const [province, city] = depsValues;
    return (
      (!province.value || v.province === province.value) &&
      (!city.value || v.city === city.value)
    );
  },
  (data) => {
    return data.map((item) => ({ label: item.name, value: item.area }));
  }
);
enum View {
  Country = 'Country',
  Region = 'Region',
  City = 'City',
}

const data = [
  {
    id: View.Country,
    label: '国家',
    task: countryTask,
  },
  {
    id: View.Region,
    label: '区域',
    task: regionTask,
  },
  {
    id: View.City,
    label: '城市',
    task: cityTask,
  },
];

const defaultValue = { value: '', dataSource: [] };
export const 异步联动 = () => {
  const ref = useRef({
    view: (context) => {
      const { status, value, next } = context;
      return (
        <Select
          disabled={status === Status.Waiting || status === Status.Running}
          state={
            status === Status.Waiting || status === Status.Running
              ? 'loading'
              : undefined
          }
          showSearch
          value={value.value}
          dataSource={value.dataSource}
          onChange={(v) => {
            next({ ...value, value: v });
          }}
        ></Select>
      );
    },
  });
  return (
    <RdxContext>
      {data.map((item, index) => {
        const depsIds = data.slice(0, index).map((item) => item.id);
        return (
          <span>
            <div>{item.label}</div>
            <RdxView<Model, any,any>
              id={item.id}
              deps={depsIds.map((item) => ({ id: item }))}
              reaction={item.task}
              defaultValue={defaultValue}
              render={ref.current.view}
            ></RdxView>
          </span>
        );
      })}
      <DevVisualGraphTool />
    </RdxContext>
  );
};

export const 查询列表_作用域 = () => {
  return (
    <RdxContext>
      {data.map((item, index) => {
        const depsIds = data.slice(0, index).map((item) => item.id);
        return (
          <span>
            <div>{item.label}</div>
            <RdxView<Model, any,any>
              id={item.id}
              scope={'filter'}
              deps={depsIds.map((item) => ({ id: item }))}
              defaultValue={defaultValue}
              render={SearchView}
            ></RdxView>
          </span>
        );
      })}
      <RdxView
        id={'SearchButton'}
        render={SearchButtonView}
        scope={'filter'}
        deps={data.map((item) => ({ id: item.id }))}
      ></RdxView>
      <RdxView
        id={'OutScope'}
        deps={[...data.slice(0, 1).map((item) => ({ id: item.id }))]}
        render={OutScopeView}
      />
      <DevVisualGraphTool />
    </RdxContext>
  );
};
const SearchView = (context: DataContext<any,any>) => {
  const { status, value, next } = context;
  return (
    <Select
      disabled={status === Status.Waiting || status === Status.Running}
      state={status === Status.Waiting ? 'loading' : undefined}
      showSearch
      value={value.value}
      dataSource={[
        { label: 'A', value: 'A' },
        { label: 'B', value: 'B' },
        { label: 'C', value: 'C' },
      ]}
      onChange={(v) => {
        next({ ...value, value: v });
      }}
    ></Select>
  );
};
const SearchButtonView = (context: DataContext<any,any>) => {
  const { mergeScopeState2Global, next, depsValues } = context;
  return (
    <div>
      <Button
        type='primary'
        onClick={() => {
          mergeScopeState2Global();
        }}
      >
        查询
      </Button>
      <br />
      <strong>筛选区域内：</strong>
      <ReactJsonView src={depsValues} />
    </div>
  );
};
const OutScopeView = (context: DataContext<any,any>) => {
  const { depsValues } = context;
  return (
    <>
      <strong>外部： </strong>
      <ReactJsonView src={depsValues} />
    </>
  );
};
