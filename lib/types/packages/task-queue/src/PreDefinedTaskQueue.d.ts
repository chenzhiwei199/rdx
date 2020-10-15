import { NotifyPoint } from '@czwcode/graph-core';
import DeliverByPreDefinedTask from './DeliverByPreDefinedTask';
export default class CommonQueue<T> extends DeliverByPreDefinedTask<T> {
    getTaskByPointWithScope(points: string[], scope: string | null): {
        key: string;
        scope: string;
    }[];
    initExecute(scope: string | null): void;
    /**
     *
     * @param newWho 谁的下游节点
     */
    notifyDownstream: (who: NotifyPoint | NotifyPoint[]) => void;
}
export declare function isString(myVar: any): boolean;
