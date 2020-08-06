export default class ScheduledCore {
    constructor(dataSource) {
        this.inDegree = new Map();
        this.deliverMap = new Map();
        this.taskQueue = [];
        this.update(dataSource);
    }
    /**
     * 更新数据
     */
    update(dataSource) {
        this.dataSource = dataSource;
        // 更新入度表
        this.inDegree = this.createInDegree();
        this.deliverMap = this.createDeliverMap();
    }
    /**
     * 创建下游通知列表
     */
    createDeliverMap() {
        const deliversMap = new Map();
        for (const item of this.dataSource) {
            for (const dep of item.deps || []) {
                const currentRelations = deliversMap.get(dep);
                if (currentRelations) {
                    currentRelations.push(item.id);
                }
                else {
                    deliversMap.set(dep, [item.id]);
                }
            }
        }
        return deliversMap;
    }
    /**
     * 创建入度表
     */
    createInDegree() {
        const m = new Map();
        this.dataSource.forEach((row) => {
            const { id, deps } = row;
            m.set(id, (deps || []).length);
        });
        return m;
    }
    /**
     * 终止调用链路
     */
    stop() {
        this.taskQueue.forEach((task) => task.stop());
        this.taskQueue = [];
    }
    canExecute(id) {
        return this.inDegree.get(id) === 0;
    }
    start(callback) {
        // 寻找初始化点
        const inDegreeZero = [];
        Array.from(this.inDegree.keys()).forEach((key) => {
            if (this.canExecute(key)) {
                inDegreeZero.push(key);
            }
        });
        this.batchExecute(inDegreeZero, callback);
    }
    batchExecute(ids, callback) {
        ids.forEach((item) => {
            this.execute(item, callback);
        });
    }
    /**
     * 执行调用链路
     */
    execute(id, callback) {
        const task = new ScheduledTask(id, () => {
            // 执行完成， 入度减1
            const deliverIds = this.deliverMap.get(id);
            deliverIds.forEach((deliverId) => {
                const currentInDegree = this.inDegree.get(deliverId);
                this.inDegree.set(deliverId, currentInDegree - 1);
            });
            // 找到下游节点，且入度为0的点，通知执行
            const willExcuteIds = deliverIds.filter((item) => this.canExecute(item));
            this.batchExecute(willExcuteIds, callback);
        }, callback);
        this.taskQueue.push(task);
        task.execute();
    }
}
export class ScheduledTask {
    constructor(id, next, callback) {
        this.stopSingnal = false;
        this.id = id;
        this.next = next;
        this.callback = callback;
    }
    isStop() {
        return this.stopSingnal;
    }
    stop() {
        this.stopSingnal = true;
    }
    execute() {
        this.callback(this.id, {
            next: () => {
                if (!this.isStop()) {
                    this.next();
                }
            },
            scheduledTask: this,
        });
    }
}
