export interface Data {
  id: string;
  deps?: string[];
}
export type Callback = (
  id: string,
  options: {
    scheduledTask: ScheduledTask;
    next: () => void;
  }
) => void;
export default class ScheduledCore {
  dataSource: Data[];
  inDegree: Map<string, number> = new Map();
  deliverMap: Map<string, string[]> = new Map();
  taskQueue: ScheduledTask[] = [];
  constructor(dataSource: Data[]) {
    this.update(dataSource);
  }

  /**
   * 更新数据
   */
  update(dataSource: Data[]) {
    this.dataSource = dataSource;
    // 更新入度表
    this.inDegree = this.createInDegree();
    this.deliverMap = this.createDeliverMap();
  }

  /**
   * 创建下游通知列表
   */
  createDeliverMap() {
    const deliversMap = new Map() as Map<string, string[]>;
    for (const item of this.dataSource) {
      for (const dep of item.deps || []) {
        const currentRelations = deliversMap.get(dep);
        if (currentRelations) {
          currentRelations.push(item.id);
        } else {
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
    const m = new Map<string, number>();
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
  start(callback: Callback) {
    // 寻找初始化点
    const inDegreeZero = [] as string[];
    Array.from(this.inDegree.keys()).forEach((key) => {
      if (this.canExecute(key)) {
        inDegreeZero.push(key);
      }
    });

    this.batchExecute(inDegreeZero, callback);
  }
  batchExecute(ids: string[], callback: Callback) {
    ids.forEach((item) => {
      this.execute(item, callback);
    });
  }
  /**
   * 执行调用链路
   */
  execute(id: string, callback: Callback) {
    const task = new ScheduledTask(
      id,
      () => {
        // 执行完成， 入度减1
        const deliverIds = this.deliverMap.get(id);
        deliverIds.forEach((deliverId) => {
          const currentInDegree = this.inDegree.get(deliverId);
          this.inDegree.set(deliverId, currentInDegree - 1);
        });

        // 找到下游节点，且入度为0的点，通知执行
        const willExcuteIds = deliverIds.filter((item) =>
          this.canExecute(item)
        );
        this.batchExecute(willExcuteIds, callback);
      },
      callback
    );
    this.taskQueue.push(task);
    task.execute();
  }
}

export class ScheduledTask {
  stopSingnal: boolean = false;
  callback: Callback;
  id: string;
  next: () => void;
  constructor(id: string, next: () => void, callback: Callback) {
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
