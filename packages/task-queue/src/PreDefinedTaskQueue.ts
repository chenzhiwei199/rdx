import { normalizeSingle2Arr, TriggerPoint } from '@czwcode/graph-core';
import DeliverByPreDefinedTask from './DeliverByPreDefinedTask';
import { BasePoint } from '@czwcode/graph-core';

export default class CommonQueue<T> extends DeliverByPreDefinedTask<T> {
  getTaskByPointWithScope(points: string[], scope: string | null) {
    return points.map((point) => {
      const t = this.getTaskByPoints(point);
      return {
        key: point,
        task: t[0].task,
        scope,
      };
    });
  }

  getTaskByPoint = (points: BasePoint[]) => {
    return points.map((point) => {
      const t = this.getTaskByPoints(point.key);
      return {
        key: point.key,
        task: t[0].task,
        scope: point.scope,
      };
    });
  };
  initExecute(scope: string | null) {
    const startPoints = this.getFirstPoints(scope);
    this.deliver(this.getTaskByPointWithScope(startPoints, scope));
  }
  /**
   *
   * @param newWho 谁的下游节点
   */
  notifyDownstream = (who: TriggerPoint | TriggerPoint[]) => {
    const newWho = normalizeSingle2Arr<TriggerPoint>(who);
    if (newWho.every((w) => isString(w.key))) {
      this.deliver(newWho);
    } else {
      console.warn('触发节点的格式必须为{ key: string, scope?: string }');
    }
  };
}

export function isString(myVar: any) {
  return typeof myVar === 'string' || myVar instanceof String;
}
