import { aggregateData, AggregateType } from '../aggregateCore';
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
test('测试Sum聚合', () => {
  expect(
    JSON.stringify(
      aggregateData({
        factTable: data,
        dimensions: ['sub'],
        measures: [{ key: 'gmv', aggregateType: AggregateType.Sum }],
      })
    )
  ).toBe('[{"sub":"上海子公司","gmv":500},{"sub":"北京子公司","gmv":500}]');
});

test('测试Count聚合', () => {
  expect(
    JSON.stringify(
      aggregateData({
        factTable: data,
        dimensions: ['sub'],
        measures: [{ key: 'gmv', aggregateType: AggregateType.Count }],
      })
    )
  ).toBe('[{"sub":"上海子公司","gmv":2},{"sub":"北京子公司","gmv":2}]');
});

test('测试Avg聚合', () => {
  expect(
    JSON.stringify(
      aggregateData({
        factTable: data,
        dimensions: ['sub'],
        measures: [{ key: 'gmv', aggregateType: AggregateType.Avg }],
      })
    )
  ).toBe('[{"sub":"上海子公司","gmv":250},{"sub":"北京子公司","gmv":250}]');
});

test('测试Max聚合', () => {
  expect(
    JSON.stringify(
      aggregateData({
        factTable: data,
        dimensions: ['sub'],
        measures: [{ key: 'gmv', aggregateType: AggregateType.Max }],
      })
    )
  ).toBe('[{"sub":"上海子公司","gmv":400},{"sub":"北京子公司","gmv":300}]');
});
