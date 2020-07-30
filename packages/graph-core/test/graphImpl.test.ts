// import GraphImpl from '../src/Graph';
// import 'jest';
// import { POINT_RELEVANT_STATUS, Point } from '../src/typings/global';
describe('graphImpl test', () => {
  test('我是无用测试', () => {
    expect(1).toBe(1);
  })
})
// const config = [
//   {
//     key: 'A',
//   },
//   {
//     key: 'B',
//     scope: 'circle',
//     deps: ['A'],
//   },
//   {
//     key: 'C',
//     scope: 'circle',
//     deps: ['B'],
//   },
//   {
//     key: 'D',
//   },
//   {
//     key: 'E',
//     deps: ['D'],
//   },
//   {
//     key: 'F',
//     deps: ['E', 'B'],
//   },
//   {
//     key: 'G',
//   },
//   {
//     key: 'H',
//     deps: ['G'],
//   },
// ] as Point[];
// const graphInstance = new GraphImpl(config);
// graphInstance.udpateRunningGraph([{ key: 'B' }]);
// describe('graphImpl test', () => {
//   test('getTriggerPointRunningStatus UP_STREAM ', () => {
//     const pointStatus = graphInstance.getTriggerPointStatus({ key: 'A'});
//     expect(pointStatus).toEqual([{ key: 'B', status: POINT_RELEVANT_STATUS.UP_STREAM }]);
//   });

//   test('getTriggerPointRunningStatus triggerPoint === runningPoint need show SAME_POINT ', () => {
//     const pointStatus = graphInstance.getTriggerPointStatus({ key: 'B'});
//     expect(pointStatus).toEqual([{ key: 'B', status: POINT_RELEVANT_STATUS.SAME_POINT }]);
//   });

//   test('getTriggerPointRunningStatus DOWN_STREAM', () => {
//     const pointStatus = graphInstance.getTriggerPointStatus({ key: 'C'});
//     expect(pointStatus).toEqual([{ key: 'B', status: POINT_RELEVANT_STATUS.DOWN_STREAM }]);
//   });

//   test('getTriggerPointRunningStatus IRRELEVANT', () => {
//     const pointStatus = graphInstance.getTriggerPointStatus({key: 'H'});
//     expect(pointStatus).toEqual([{ key: 'B', status: POINT_RELEVANT_STATUS.IRRELEVANT }]);
//   });

//   test('getTriggerPointRunningStatus isUpStream in trigger Scope', () => {
//     const pointStatus = graphInstance.getTriggerPointStatus({ key: 'B', scope: 'circle'});
//     expect(pointStatus).toEqual([{ key: 'B', status: POINT_RELEVANT_STATUS.SAME_POINT }]);
//   });
// });
