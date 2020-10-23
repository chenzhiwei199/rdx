---
id: RdxContext
title: RdxContext
---

给atoms 和 computes 提供上下文环境。这必是所有使用Rdx hooks 的祖先节点。多个节点可以共存，但如果是嵌套的，那么内部的节点和外部节点中的 atoms 和 computes是完全隔离的。

---

Props: 
- context?: React.Context< ShareContextClass>

  配合 createRdxStateContext和createRdxHooks创建一个新的上下文.
- initializeState?: MapObject< any >;

  一个可选的默认状态，通过这个状态可以对RdxContext进行atoms 和 compute值的初始化.
- onChange?: (state: MapObject< any >) => void;

  当RdxContext中的状态发生变更的时候，会触发改回调
- onLoading?: () => void

  当RdxContext中的状态发生变更的时候，会触发该回调
- visualStatePlugins?: React.ReactNode | React.ReactNode[];

  可以通过该属性传入@czwcode/rdx-plugins中的可视化调试工具

### Example
```jsx
import { RdxContext } from '@czwcode/rdx';

function AppRoot() {
  return (
    <RdxContext>
      <ComponentThatUsesRdx />
    </RdxContext>
  );
}
```