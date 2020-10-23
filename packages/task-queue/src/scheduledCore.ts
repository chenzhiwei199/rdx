import uuid from 'uuid'
export interface Data {
  id: string;
  deps?: string[];
}

/**
 * 任务执行单元
 * id:当前任务唯一标识
 */
export type Callback = (id: string, options: CallbackOptions) => void;

/**
 * next: 通过该方法通知下游任务执行
 * isStop: 通过该方法判断任务是否终止
 * close: 通过该方法，关闭任务执行，并且不执行下游任务
 */
export interface CallbackOptions {
  isPause: () => boolean;
  close: () => void;
  next: () => void;
}
/**
 * 任务执行管理器
 * 1. 支持任务Pause
 * 2. 支持任务Continue
 *
 * @export
 * @class ScheduledCore
 */
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

    const canReusePoints = currentStartPoints.filter((id) => {
      return canReuse && canReuse(id);
    });
    
    // 关闭不可复用的任务
    for (let key of Array.from(this.taskQueue.keys())) {
      if (!canReusePoints.includes(key)) {
        this.closeTask(key);
      }
    }
  }

  /**
   * 关闭某个任务
   *
   * @param {string} key
   * @memberof ScheduledCore
   */
  closeTask(key: string) {
    if(this.taskQueue.has(key)) {
      const task = this.taskQueue.get(key)
      task.pause();
      (task as any).c = 1
    }

    this.taskQueue.delete(key);
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
    const close = () => {
      this.closeTask(id);
    };
    let task;
    if (this.taskQueue.has(id)) {
      // 执行下游任务
      task = this.taskQueue.get(id).fork({ next, close})
    } else {
      // 没有可以复用的任务，创建新的任务
      task = new ScheduledTask({
        id,
        next,
        executeCallback: callback,
        close,
      });
    }

    this.taskQueue.set(id, task);
    task.execute();
  }
}

export class ScheduledTask {
  pauseSignal: boolean = false;
  finishSignal: boolean = false;
  executeCallback: Callback;
  id: string;
  next: () => void;
  close: () => void;
  promise: Promise<any>;
  resolvePersist: () => void;
  // 暂停调用时的回调，当任务是fork出来的时候，需要关闭原来的task
  pauseCallback?: () => void
  constructor(config: {
    id: string;
    next: () => void;
    close: () => void;
    executeCallback: Callback;
    pauseCallback?: () => void
  }) {
    const { id, next, close, executeCallback, pauseCallback } = config;
    this.id = id;
    this.next = next;
    this.close = close;
    this.executeCallback = executeCallback;
    this.pauseCallback = pauseCallback;
    this.promise = new Promise((resove, reject) => {
      this.resolvePersist = resove as any;
    });
  }
  isPause() {
    return this.pauseSignal;
  }
  pause() {
    this.pauseCallback && this.pauseCallback()
    this.pauseSignal = true;
  }
  /**
   * 执行任务,
   *
   * @memberof ScheduledTask
   */
  execute() {
    this.executeCallback(this.id, {
      next: () => {
        if (!this.isPause()) {
          this.finishSignal = true
          this.resolvePersist();
          // 通知下游
          this.next();
        }
      },
      isPause: () => this.isPause(),
      close: () => {
        this.close();
      },
    });
  }

  fork(config: { next: () => void, close: () => void}) {
    const { next, close} = config
    const task = new ScheduledTask({
      id: this.id,
      next,
      close,
      pauseCallback: () => {
        // fork出来的task被暂停的时候，需要暂停依赖的节点
        this.pause()
      },
      executeCallback: (id, options) => {
        // 构造callback
        const { next } = options;
        if(this.finishSignal) {
          // 已经执行完了
          next()
        } else {
          // 还没有执行完，等待执行
          this.promise.then(() => {
            next();
          });
        }
        
      }
    });
    return task
  }
}



// export class ScheduledTask {
//   stopSingnal: boolean = false;
//   callback: Callback;
//   id: string;
//   next: () => void;
//   promise: Promise<any>;
//   resolvePersist: () => void;
//   rejectPersist: () => void;
//   constructor(id: string, next: () => void, callback: Callback) {
//     this.id = id;
//     this.next = next;
//     this.callback = callback;
//     this.promise = new Promise((resove, reject) => {
//       this.resolvePersist = resove;
//       this.rejectPersist = reject;
//     });
//   }
//   isStop() {
//     return this.stopSingnal;
//   }
//   stop() {
//     this.stopSingnal = true;
//   }
//   execute() {
//     this.callback(this.id, {
//       next: () => {
//         if (!this.isStop()) {
//           this.resolvePersist();
//           this.next();
//         }
//       },
//       scheduledTask: this,
//     });
//   }
//   fork(next: () => void) {
//     return new ScheduledTask(this.id, next, (id, options) => {
//       const { next } = options;
//       this.promise.then(() => {
//         next();
//       });
//     });
//   }
// }
