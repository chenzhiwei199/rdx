import { normalizeSingle2Arr } from '@czwcode/graph-core';
import DeliverByPreDefinedTask from './DeliverByPreDefinedTask';
export default class CommonQueue extends DeliverByPreDefinedTask {
    constructor() {
        super(...arguments);
        this.getTaskByPoint = (points) => {
            return points.map((point) => {
                const t = this.getTaskByPoints(point.key);
                return {
                    key: point.key,
                    task: t[0].task,
                    scope: point.scope,
                };
            });
        };
        /**
         *
         * @param newWho 谁的下游节点
         */
        this.notifyDownstream = (who) => {
            const newWho = normalizeSingle2Arr(who);
            if (newWho.every((w) => isString(w.key))) {
                this.deliver(newWho);
            }
            else {
                console.warn('触发节点的格式必须为{ key: string, scope?: string }');
            }
        };
    }
    getTaskByPointWithScope(points, scope) {
        return points.map((point) => {
            const t = this.getTaskByPoints(point);
            return {
                key: point,
                task: t[0].task,
                scope,
            };
        });
    }
    initExecute(scope) {
        const startPoints = this.getFirstPoints(scope);
        this.deliver(this.getTaskByPointWithScope(startPoints, scope));
    }
}
export function isString(myVar) {
    return typeof myVar === 'string' || myVar instanceof String;
}
