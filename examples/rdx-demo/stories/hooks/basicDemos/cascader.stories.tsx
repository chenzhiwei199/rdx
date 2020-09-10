import React from 'react';
import {
  watcher,
  atom,
  RdxContext,
  useRdxState,
  useRdxValueLoader,
  Status,
  RdxNode,
} from '@czwcode/rdx';
import axios from 'axios';
import { Menu, Grid } from '@alifd/next';
const { Row, Col } = Grid;
export default {
  title: '简单例子/hooks用法',
  parameters: {
    info: { inline: true },
  },
};

const administrativeData = watcher<AdministrativeSource[]>({
  id: 'administrativeData',
  get: async () => {
    const res = await axios.get(
      'https://os.alipayobjects.com/rmsportal/ODDwqcDFTLAguOvWEolX.json'
    );
    return res.data;
  },
});

const cityDataSource = watcher({
  id: 'cityDataSource',
  get: ({ get }) => {
    console.log('cityDataSource: ', get(administrativeData));
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

const areaDataSource = watcher({
  id: 'areaDataSource',
  get: ({ get }) => {
    // 过滤第一层
    let findItem = (get(administrativeData) || []).find(
      (item) => item.value === get(province)
    );
    console.log('findItem: ', findItem);
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
  atom: RdxNode<string>;
  watcher: RdxNode<AdministrativeSource[]>;
}) => {
  const { atom, watcher } = props;

  const [value, setValue] = useRdxState(atom);
  const [status, dataSource] = useRdxValueLoader(watcher);
  if (status !== Status.IDeal) {
    return <div>loading...</div>;
  }
  console.log('xxxxxxdataSource: ', dataSource);
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
          <View atom={province} watcher={administrativeData} />
        </Col>
        <Col>
          <View atom={city} watcher={cityDataSource} />
        </Col>
        <Col>
          <View atom={area} watcher={areaDataSource} />
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
