import React from 'react';
import {
  compute,
  atom,
  RdxContext,
  useRdxState,
  useRdxValueLoader,
  Status,
  RdxState,
} from '@czwcode/rdx';
import axios from 'axios';
import { Menu, Grid } from '@alifd/next';

const { Row, Col } = Grid;
export default {
  title: '简单例子/级联用法',
  parameters: {
    info: { inline: true },
  },
};

const administrativeData = compute<AdministrativeSource[]>({
  id: 'administrativeData',
  get: async () => {
    const res = await axios.get(
      'https://os.alipayobjects.com/rmsportal/ODDwqcDFTLAguOvWEolX.json'
    );
    return res.data;
  },
});

const cityDataSource = compute({
  id: 'cityDataSource',
  get: ({ get }) => {
    const findItem = (get(administrativeData) || []).find(
      (item) => item.value === get(province)
    );
    if (findItem) {
      return findItem.children || [];
    } else {
      return [];
    }
  },
});

const areaDataSource = compute({
  id: 'areaDataSource',
  get: ({ get }) => {
    // 过滤第一层
    let findItem = (get(administrativeData) || []).find(
      (item) => item.value === get(province)
    );
    findItem = (findItem ? findItem.children || [] : []).find(
      (item) => item.value === get(city)
    );
    if (findItem) {
      return findItem.children || [];
    } else {
      return [];
    }
  },
});

const province = atom({
  id: 'province',
  defaultValue: '',
});
const city = atom({
  id: 'city',
  defaultValue: '',
});
const area = atom({
  id: 'area',
  defaultValue: '',
});

const View = (props: {
  atom: RdxState<string>;
  compute: RdxState<AdministrativeSource[]>;
}) => {
  const { atom, compute } = props;

  const [value, setValue] = useRdxState(atom);
  const [status, dataSource] = useRdxValueLoader(compute);
  if (status !== Status.IDeal) {
    return <div>loading...</div>;
  }
  return (
    <Menu
      onItemClick={(key) => {
        setValue(key);
      }}
      selectMode={'single'}
      selectedKeys={value}
      style={{ width: 100 }}
    >
      {dataSource.map((item) => (
        <Menu.Item key={item.value}>{item.label}</Menu.Item>
      ))}
    </Menu>
  );
};

export const 联动Hooks例子 = () => {
  return (
    <RdxContext>
      {/* <DevVisualGraphTool /> */}
      <Row>
        <Col>
          <h3>province</h3>
          <View atom={province} compute={administrativeData} />
        </Col>
        <Col>
          <h3>city</h3>
          <View atom={city} compute={cityDataSource} />
        </Col>
        <Col>
          <h3>area</h3>
          <View atom={area} compute={areaDataSource} />
        </Col>
      </Row>
    </RdxContext>
  );
};
interface AdministrativeSource {
  children: AdministrativeSource[];
  value: string;
  label: string;
}
