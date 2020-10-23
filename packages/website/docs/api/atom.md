---
id: atom
title: atom(options)
---

atom在Rdx中代表一个状态。atom() 函数返回一个可以读写的RdxState。

---
```jsx
function atom<T>({
  id: string,
  defaultValue: T | Promise<T> | RdxState<T>,
}): RdxState<T>
```
- id 一个唯一的字符串，用来在RdxContext下标记一个唯一的atom状态。
- defaultValue 当atom在RdxContext下初始化时的默认值。

---
通常的时候，atom可以配合一下hooks一起使用
- [`useRdxState()`](/docs/api/useRdxState) 
- [`useRdxValue()`](/docs/api/useRdxValue) 
- [`useRdxSetter()`](/docs/api/useRdxSetter) 
--- 
### Example