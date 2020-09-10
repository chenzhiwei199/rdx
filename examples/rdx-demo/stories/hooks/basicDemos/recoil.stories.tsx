import React, { Suspense } from 'react';
import {
  selector as watcher,
  atom,
  RecoilRoot as RdxContext,
  useRecoilValue as useRdxValue,
  useRecoilState as useRdxState,
} from 'recoil';
import axios from 'axios';
import { RdxNode } from '../../../../../packages/rdx/src/RdxValues/base';
import { Menu, Grid } from '@alifd/next';
const { Row, Col } = Grid;
export default {
  title: '简单例子/recoil',
  parameters: {
    info: { inline: true },
  },
};

const province = atom({
  key: 'province',
  default: '',
});

const city = atom({
  key: 'city',
  default: '',
});
const administrativeData = watcher<AdministrativeSource[]>({
  key: 'administrativeData',
  get: async () => {
    const res = await axios.get(
      'https://os.alipayobjects.com/rmsportal/ODDwqcDFTLAguOvWEolX.json'
    );
    return res.data;
  },
});
const cityDataSource = watcher({
  key: 'cityDataSource',
  get: ({ get }) => {
    console.log('cityDataSource: ', get(administrativeData));
    const findItem = get(administrativeData).find(
      (item) => item.value === get(province)
    );
    if (findItem) {
      return findItem.children || [];
    } else {
      return [];
    }
  },
});
const area = atom({
  key: 'area',
  default: '',
});

const areaDataSource = watcher({
  key: 'areaDataSource',
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

const View = (props: {
  atom: RdxNode<string>;
  watcher: RdxNode<AdministrativeSource[]>;
}) => {
  const { atom, watcher } = props;
  const [value, setValue] = useRdxState(atom);
  const dataSource = useRdxValue(watcher);
  console.log('xxxxxdataSource: ', atom, dataSource);
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
      <Suspense fallback={<div>...</div>}>
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
      </Suspense>
    </RdxContext>
  );
};
interface AdministrativeSource {
  children: AdministrativeSource[];
  value: string;
  label: string;
}
