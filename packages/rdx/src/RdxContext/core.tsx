export interface Base<T> {
  remove(key: string, scope?: string): void;
  update(key: string, value: T, scope?: string): void 
  get(key: string, scope?: string): T | null 
  getAll(): any 
  clone(): Base<T>;
  merge(scope: string): void
}
export class BaseMap<T extends Object> implements Base<T> {
  clone(): Base<T> {
    return new BaseMap(this.v) as any
  }
  merge(scope: string): void {
    throw new Error("Method not implemented.");
  }
  v: Map<string, T | null>;
  constructor(v: Map<string, T | null>) {
    this.v = v;
  }
  get(key: string, scope?: string) {
    return this.v.get(key) || null;
  }
  removeAll() {
    this.v.clear()
  }
  remove(rkey: string, scope?: string) {
    const newMap = new Map();
    Array.from(this.v.keys()).forEach((key) => {
      if (key !== rkey) {
        newMap.set(key, this.v.get(key));
      }
    });
    this.v = newMap
  }
  update(key: string, value: T, scope?: string) {
    const newV = new Map(this.v)
    newV.set(key, value as any);
    this.v = newV
    return this;
  }
  getAll() {
    return this.v;
  }
}

export class BaseObject<T extends Object> implements Base<T> {
  constructor(v: { [key: string]: T | null }) {
    this.v = v;
  }
  v: { [key: string]: T | null };
  remove(key: string, scope?: string) {
    this.v = {
      ...this.v,
      [key]: null,
    }
  }
  merge(scope: string): void {
    throw new Error("Method not implemented.");
  }
  clone() {
    return new BaseObject(this.v)
  }
  getAll() {
    return this.v;
  }
  get(key: string, scope?: string): T {
    return this.v[key] as T;
  }
  update(key: string, value: T, scope?: string) {
    this.v = { ...this.v, [key]: value}
    return this as any
  }
}

export class ScopeObject<T extends Object> extends BaseObject<T> {
  scopeEditState: Map<string, BaseObject<T>>;
  constructor(
    v: { [key: string]: T | null },
    scopeState?: Map<string, BaseObject<T>>
  ) {
    super(v);
    this.scopeEditState = new Map();
    // ?有点问题, 新建，不引用原来对象
    if (scopeState) {
      Array.from(scopeState.keys()).forEach((scope) => {
        this.scopeEditState.set(scope, scopeState.get(scope));
      });
    }
  }
  getCurrentScopeState(scope?: string) {
    return this.scopeEditState.get(scope);
  }
  hasScopeState(scope?: string) {
    return Boolean(this.scopeEditState.get(scope));
  }
  get(key: string, scope?:string) {
    if (!scope) {
      return super.get(key);
    }
    const scopeState = this.getCurrentScopeState(scope);
    const vInScope = scopeState && scopeState.get(key);
    if (scopeState && vInScope !== undefined) {
      return vInScope;
    } else {
      return super.get(key);
    }
  }
  remove(key: string, scope?: string) {
    super.remove(key, scope);
    if (this.hasScopeState(scope)) {
      // 清理作用域数据
      this.scopeEditState.set(scope, null);
    }
  }
  merge(scope) {
    const hasScope = this.hasScopeState(scope);
    if (hasScope) {
      // 获取当前作用域的数据
      const currentScopeState = this.getCurrentScopeState(scope);
      // 清理作用域数据
      this.scopeEditState.set(scope, null);
      // 合并到全局数据中
      this.v = Object.assign({}, super.getAll(), currentScopeState.getAll());
    }
  }
  clone() {
    return new ScopeObject<T>(super.getAll(), this.scopeEditState) as any;
  }
  update(key, value, scope) {
    let state = super.getAll();
    if (!scope) {
      state = super.update(key, value, scope).getAll();
    } else {
      const hasScope = this.hasScopeState(scope);
      if (!hasScope) {
        this.scopeEditState.set(scope, new BaseObject({ [key]: value }));
      } else {
        const currentScopeState = this.getCurrentScopeState(scope);
        this.scopeEditState.set(scope, currentScopeState.update(key, value));
      }
    }
    this.v = state
  }
}
