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
  taskQueue: Map<string, ScheduledTask> = new Map();
  constructor(dataSource: Data[]) {
    this.update(dataSource);
  }

  /**
   * 更新数据
   */
  update(dataSource: Data[], canReuse?: (id) => boolean) {
    this.dataSource = dataSource;
    // 更新入度表
    this.inDegree = this.createInDegree();
    this.deliverMap = this.createDeliverMap();
    //判断是否有可以重复利用的任务
    const currentStartPoints = this.getStartPoints();
    
    // 停止不可复用的任务
    const canReusePoints = currentStartPoints.filter((id) => {
      return canReuse && canReuse(id);
    });
    console.log('currentStartPoints: ', currentStartPoints, canReusePoints);
    Array.from(this.taskQueue.keys()).forEach((key) => {
      if (!canReusePoints.includes(key)) {
        this.taskQueue.get(key) && this.taskQueue.get(key).stop();
        this.taskQueue.delete(key);
      }
    });
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
    this.taskQueue.clear();
  }
  canExecute(id) {
    return this.inDegree.get(id) === 0;
  }
  getStartPoints() {
    const inDegreeZero = [] as string[];
    Array.from(this.inDegree.keys()).forEach((key) => {
      if (this.canExecute(key)) {
        inDegreeZero.push(key);
      }
    });
    return inDegreeZero;
  }
  start(callback: Callback) {
    this.batchExecute(this.getStartPoints(), callback);

    //  // 获得可复用的任务
    //  const insectionsPoints = currentStartPoints.filter((id) => {
    //   return this.taskQueue.has(id)
    // })
    // const canReusePoints = insectionsPoints.filter(id => {
    //   return canReuse(id) || false
    // })
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
    const next = () => {
      // 任务执行完成，关闭任务
      this.taskQueue.delete(id);
      // 执行完成， 入度减1
      const deliverIds = this.deliverMap.get(id) || [];
      deliverIds.forEach((deliverId) => {
        const currentInDegree = this.inDegree.get(deliverId);
        this.inDegree.set(deliverId, currentInDegree - 1);
      });

      // 找到下游节点，且入度为0的点，通知执行
      const willExcuteIds = deliverIds.filter((item) => this.canExecute(item));
      this.batchExecute(willExcuteIds, callback);
    };
    // 如果没有重用任务，则创建新任务，否则复用上次的任务
    let task;
    if (this.taskQueue.has(id)) {
      task = this.taskQueue.get(id).fork(next);
    } else {
      task = new ScheduledTask(id, next, callback);
    }

    this.taskQueue.set(id, task);
    task.execute();
  }
}

export class ScheduledTask {
  stopSingnal: boolean = false;
  callback: Callback;
  id: string;
  next: () => void;
  promise: Promise<any>;
  resolvePersist: () => void;
  rejectPersist: () => void;
  constructor(id: string, next: () => void, callback: Callback) {
    this.id = id;
    this.next = next;
    this.callback = callback;
    this.promise = new Promise((resove, reject) => {
      this.resolvePersist = resove as any;
      this.rejectPersist = reject;
    });
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
          this.resolvePersist();
          this.next();
        }
      },
      scheduledTask: this,
    });
  }
  fork(next: () => void) {
    return new ScheduledTask(this.id, next, (id, options) => {
      const { next } = options;
      this.promise.then(() => {
        next();
      });
    });
  }
}
