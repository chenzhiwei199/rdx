import Graph from '../src/BaeGraph';
import 'jest';
import { Point } from '../src/typings/global';

const config = [
  {
    key: 'A',
  },
  {
    key: 'B',
    scope: 'circle',
    deps: ['A'],
  },
  {
    key: 'C',
    scope: 'circle',
    deps: ['B'],
  },
  {
    key: 'D',
  },
  {
    key: 'E',
    deps: ['D'],
  },
  {
    key: 'F',
    deps: ['E', 'B'],
  },
  {
    key: 'G',
  },
  {
    key: 'H',
    deps: ['B'],
    scope: 'rect',
  },
  {
    key: 'I',
  },
  {
    key: 'J',
    deps: ['I'],
    scope: 'rect',
  },
] as Point[];
const graphInstance = new Graph(config);
describe('deliver test', () => {
  test('getFirstPoints 测试无作用域的情况，找到所有起点', () => {
    const points = graphInstance.getFirstPoints();
    expect(points).toEqual(['A', 'D', 'G', 'I']);
  });

  test('getFirstPoints by scope 测试当前作用域下，所有的起点', () => {
    const points = graphInstance.getFirstPoints('circle');
    expect(points).toEqual(['B']);
  });

  test('getPointsByScope ', () => {
    const points = graphInstance.getPointsByScope([{ key: 'A' }]);
    expect(points).toEqual(['A', 'B', 'C', 'F', 'H']);
  });

  test('getPointsByScope by scope ', () => {
    const points = graphInstance.getPointsByScope([
      {
        key: 'B',
        scope: 'circle',
      },
    ]);
    expect(points).toEqual(['B', 'C']);
  });
});
