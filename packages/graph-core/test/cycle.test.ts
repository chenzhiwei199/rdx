import 'jest';
import graphLib from 'graphlib'

describe('cycle test', () => {
  test('isAcyclic test', () => {
    var g = new graphLib.Graph();
    g.setNode('a')
    g.setNode('b')
    g.setEdge('a','b')
    g.setEdge('b','a')
    expect(graphLib.alg.isAcyclic(g)).toBe(true)
  })
})