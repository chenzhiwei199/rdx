import {
  createGraph,
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
      {
        id: '3'
      }
    ];
    const graph = createGraph(config);
    console.log(graphlib.alg.preorder(graph, ['1']))
    done();
  });
});
