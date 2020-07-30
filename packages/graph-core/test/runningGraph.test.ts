import 'jest';
import RunningMap from '../src/runningGraph';
import { Point } from '../src/typings/global';

const config = [
  { key: '1', deps: undefined },
  { key: '2', deps: ['1'] },
  { key: '3', deps: ['2'] },
  { key: '4' },
] as Point[];
describe('RunningMap Test', () => {
  test('setRunning & getRunning Test ', () => {
    const runningMap = new RunningMap(config);
    runningMap.setRunningStatus('1');
    expect(runningMap.getRunningPoints().map(point => point.key)).toEqual([
      '1',
    ]);
  });

  test('setFinish & getNotFinish Test', () => {
    const runningMap = new RunningMap(config);
    runningMap.setFinishStatus('2');
    expect(runningMap.getNotFinishPoints().map(point => point.key)).toEqual([]);
  });

  test('setPedding & getNotFinish Test', () => {
    const runningMap = new RunningMap(config);
    runningMap.setPendingStatus('3');
    expect(runningMap.getNotFinishPoints().map(point => point.key)).toEqual([
      '3',
    ]);
  });
});
