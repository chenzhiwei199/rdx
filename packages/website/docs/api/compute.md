---
id: compute
title: compute()
---

compute 在 Rdx 中代表一个计算的状态。compute() 函数返回一个可以读写的 RdxState。

---

### API

```jsx
function atom<GModel>({
  id: string,
  defaultValue: GModel | Promise<GModel> | RdxState<GModel>,
  get: IRdxComputeGet,
  set?: IRdxComputeSet<GModel>
}): RdxState<T>
```

```jsx
type IRdxComputeGet<GModel> = (config: IRdxComputeGetParams ) => DataModel<GModel>;
type IRdxComputeSet<GModel> = (config: { id: string; get: RdxGet; set: RdxSet; reset: RdxReset;},newValue:GModel) => void;
interface IRdxComputeGetParams {
  id: string;
  get: RdxGet;
}
type RdxGet = <GModel>(node: TPath<GModel>) => GModel;
type RdxSet = <GModel>(
  node: TPath<GModel>,
  value: ValueOrUpdater<GModel>
) => void;
type RdxReset = <GModel>(node: RdxState<GModel>) => void;
```

- id id 一个唯一的字符串，用来在RdxContext下标记一个唯一的compute状态。
- defaultValue 当compute在RdxContext下初始化时的默认值, 一般情况下你不需要使用它。
- get
- set

---

### Relations

通常的时候，atom 可以配合一下 hooks 一起使用

---

### EXAMPLE
