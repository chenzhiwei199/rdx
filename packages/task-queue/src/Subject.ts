import { normalizeSingle2Arr } from '@czwcode/graph-core';

export class Subject<T> {
  subscribtion: Subscribtion<T> | null = null;
  _isComplete: boolean = false;
  constructor() {}
  next(v: T) {
    this.subscribtion && this.subscribtion.next();
    this._isComplete = true;
  }

  isComplete() {
    return this._isComplete;
  }
  subscribe(callback: () => void): Subscribtion<T> {
    this.subscribtion = new Subscribtion(this);
    return this.subscribtion.subscribe(callback);
  }
}

export function zip<T>(subjects: Subject<T>[]) {
  return new Subscribtion(subjects);
}
export class Subscribtion<T> {
  callback?: () => void;
  subjects: Subject<T>[];
  constructor(subject: Subject<T> | Subject<T>[]) {
    this.subjects = normalizeSingle2Arr<Subject<T>>(subject);
  }
  next() {
    const completeSubjects = this.subjects.filter((item) => item.isComplete());
    if (completeSubjects.length === this.subjects.length - 1) {
      this.callback && this.callback();
    }

    this.subjects;
  }
  subscribe(callback: () => void): Subscribtion<T> {
    this.callback = callback;
    return this;
  }
  unsubscribe() {
    this.subjects = [];
  }
}

// 1. 建立调度
// 2. 建立调度终止节点
// 3. 触发调度
// 4. 按照顺序，执行调度
// 5. 触发终止节点
