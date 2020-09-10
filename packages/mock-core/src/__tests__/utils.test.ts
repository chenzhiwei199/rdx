import { dataFilter } from '../utils';
import { Operator } from '../types';
const data = [
  {
    sub: '上海子公司',
    store: '金桥店',
    gmv: 100,
  },
  {
    sub: '上海子公司',
    store: '虹桥店',
    gmv: 400,
  },
  {
    sub: '北京子公司',
    store: 'A',
    gmv: 200,
  },
  {
    sub: '北京子公司',
    store: 'B',
    gmv: 300,
  },
];
test('测试And筛选', () => {
  expect(
    JSON.stringify(
      dataFilter(data, [
        { member: 'sub', values: '上海子公司', operator: Operator.equals },
        { member: 'store', values: '虹桥店', operator: Operator.equals },
      ])
    )
  ).toBe('[{"sub":"上海子公司","store":"虹桥店","gmv":400}]');
});

test('测试Or筛选', () => {
  expect(
    JSON.stringify(
      dataFilter(data, [
        [
          { member: 'sub', values: '上海子公司', operator: Operator.equals },
          { member: 'store', values: 'A', operator: Operator.equals },
        ],
      ])
    )
  ).toBe(
    '[{"sub":"上海子公司","store":"金桥店","gmv":100},{"sub":"上海子公司","store":"虹桥店","gmv":400},{"sub":"北京子公司","store":"A","gmv":200}]'
  );
});
