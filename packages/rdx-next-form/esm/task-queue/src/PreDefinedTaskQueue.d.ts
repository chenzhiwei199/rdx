import { TriggerPoint } from '@czwcode/graph-core';
import DeliverByPreDefinedTask from './DeliverByPreDefinedTask';
import { BasePoint } from '@czwcode/graph-core';
export default class CommonQueue<T> extends DeliverByPreDefinedTask<T> {
    getTaskByPointWithScope(points: string[], scope: string | null): {
        key: string;
        task: import(".").MixedTask<T>;
        scope: string;
    }[];
    getTaskByPoint: (points: BasePoint[]) => {
        key: string;
        task: import(".").MixedTask<T>;
        scope: string;
    }[];
    initExecute(scope: string | null): void;
    /**
     *
     * @param newWho 谁的下游节点
     */
    notifyDownstream: (who: TriggerPoint | TriggerPoint[]) => void;
}
export declare function isString(myVar: any): boolean;
