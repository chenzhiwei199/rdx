import graphlib from 'graphlib';
import BaseGraphOld from '../src/BaeGraph_Old';
import BaseGraph from '../src/BaseGraph';

describe('deliver test', () => {
  it('简单关联，寻找下游点', (done) => {
    const config = [
      {
        key: '1',
      },
      {
        key: '2',
        deps: ['1'],
      },
    ];
    const graphOld = new BaseGraphOld(config)
    const graph = new BaseGraph(config)
    console.log(graph.getAllPointsByPoints({ key: '1'}))
    console.log(graphOld.getAllPointsByPoints({ key: '1'}))
    done();
  });

  it('简单关联，寻找下游点', (done) => {
    const config = [
     
      {
        key: 'A',
      },
      {
        key: 'C',
        deps: ['A']
      },
      {
        key: 'D',
        deps: ['B'],
      },
      {
        key: 'B',
      },
      {
        key: 'E',
      },
    ];
    const graphOld = new BaseGraphOld(config)
    const graph = new BaseGraph(config)
    console.log("old", graphOld.getAllPointsByPoints([{ key: 'B', downStreamOnly: false }, { key: 'A', downStreamOnly: true }]))
    console.log("current", graph.getAllPointsByPoints([{ key: 'B', downStreamOnly: false }, { key: 'A', downStreamOnly: true }]))
    done();
  });

  it('简单关联，寻找下游点', (done) => {
    const config = [
     
      {
        key: 'A',
        deps: ['B']
      },
      {
        key: 'C',
        deps: ['A']
      },
      {
        key: 'D',
        deps: ['B'],
      },
      {
        key: 'B',
      },
      {
        key: 'E',
      },
    ];
    const graphOld = new BaseGraphOld(config)
    const graph = new BaseGraph(config)
    console.log("old", graphOld.getAllPointsByPoints([{ key: 'B', downStreamOnly: false }, { key: 'A', downStreamOnly: true }]))
    console.log("current", graph.getAllPointsByPoints([{ key: 'B', downStreamOnly: false }, { key: 'A', downStreamOnly: true }]))
    done();
  });
 
});
