import {
  createGraph,
  findSameArray,
  findNotMaxWidgetEdge,
  createGraphByGraphAndCircle,
  removeCircleEdges,
  toConfig,
} from '../src/utils';
import graphlib from 'graphlib';
describe('deliver test', () => {
  it('create Graph test', (done) => {
    const config = [
      {
        id: '1',
      },
      {
        id: '2',
        deps: [{ id: '1', weight: 22 }],
      },
    ];
    const graph = createGraph(config);
    graph.hasNode('1');
    graph.removeEdge('1', '2');
    done();
  });
  it('find cycles and clean edges', (done) => {
    // A 表示总价 B表示数量  C表示单价
    const bigWeight = 100;
    const smallWeight = 10;
    const config = [
      {
        id: 'A',
        deps: [
          { id: 'B', weight: bigWeight },
          { id: 'C', weight: bigWeight },
          { id: 'D' },
        ],
      },
      {
        id: 'B',
        deps: [
          { id: 'A', weight: bigWeight },
          { id: 'C', weight: smallWeight },
        ],
      },
      {
        id: 'C',
        deps: [
          { id: 'A', weight: smallWeight },
          { id: 'B', weight: smallWeight },
        ],
      },
      { id: 'D' },
    ];
    const graph = createGraph(config);
    const triggerKey = 'D';

    // 清理无用边
    removeCircleEdges(graph, graph, triggerKey);
    const isAllNodeExist = config.every((item) => {
      return graph.hasNode(item.id);
    });
    const noCircle = graphlib.alg.isAcyclic(graph);
    const inOrder =
      JSON.stringify(graphlib.alg.topsort(graph)) ===
      JSON.stringify(['D', 'A', 'B', 'C']);
    if (isAllNodeExist && noCircle && inOrder) {
      done();
    } else {
      throw 'error';
    }
  });
  it('directed graph', (done) => {
    // A 表示总价 B表示数量  C表示单价
    const bigWeight = 100;
    const smallWeight = 10;
    const config = [
      {
        id: 'A',
        deps: [{ id: 'B', weight: bigWeight }],
      },
      {
        id: 'B',
        deps: [{ id: 'C', weight: smallWeight }],
      },
      {
        id: 'C',
      },
    ];
    const graph = createGraph(config);

    // 清理无用边
    removeCircleEdges(graph, graph);
    const inOrder =
      JSON.stringify(graphlib.alg.topsort(graph)) ===
      JSON.stringify(['C', 'B', 'A']);
    if (inOrder) {
      done();
    } else {
      throw 'error';
    }
  });
  it('directed graph xxx', (done) => {
    // A 表示总价 B表示数量  C表示单价
    const config = [
      {
        id: 'Total',
        deps: [
          { id: 'Amount', weight: 100 },
          { id: 'Unit', weight: 100 },
        ],
      },
      {
        id: 'Unit',
        deps: [
          { id: 'Total', weight: 10 },
          { id: 'Amount', weight: 10 },
        ],
      },
    ];
    const graph = createGraph(config);

    // 清理无用边
    removeCircleEdges(graph, graph, 'Unit');
    graph.removeNode('Unit')
    console.log('graphxxx: ', toConfig(graph));
    // console.log('graph: ', graphlib.json.write(graph));
    done();
  });
});
