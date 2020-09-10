### 用处

- 通过提供组件的任务流管理器，定向更新组件内容
- 减少重复渲染
- 避免任务重复执行
- 避免由于请求返回时间的不确定性，导致展示数据出现问题
- 记录所有当前节点的运行状态，避免用户进行过多无用的操作

### 如何使用

### feature

- taskItem 组件更新
- 循环依赖的调度(保证运行时不成闭环)
- 阻塞第一次渲染，渲染统一由 context 管控

### 2.x 功能迭代

- 在 1.0 的版本基础上，新增调度中心的概念，调度中心可以统一管理默认值的数据，并检查是否要发起新的请求
- 通过 forceUpdate & shouldComponentUpdate 的组合方式强管控下层组件的渲染逻辑，
- ReactFieldContext 新增了两个新的参数， value & state， 并新增了两个校验方法，用来对每一个调度是否触发进行判断
- immer 变为必须的依赖，通过 immer 可以很好的通过 shallowEqual 的方式校验调度的更新

### 功能设计

- context 共享中心
  - 状态
  - 任务信息
  - 节点数据
  - 节点状态
    - 节点当前运行装填
    - 节点运行失败的错误信息
    - cancelMap 取消队列
  - Action
    - 新增
    - 更新
    - 删除
- 任务调度中心
  - 单个任务执行 单个组件内部数据发生改变
  - 多任务执行 共享中心派发
  - dfs 任务执行 初始化任务执行
- 生命周期
  - 初始化阶段
    - init 初始化
    - beforeExecute
    - execute
    - onPreChange
    - onChange
    - onError
  - 更新阶段
    - 更新阶段初始化状态
    - beforeExecute
    - execute
    - onPreChange
    - onChange
    - onError
  - taskInfo 更新
  - addTask
    新增的任务节点，会触发任务的节点的任务执行
  - removeTask
    移除任务节点，会触发所有依赖此节点的任务重新执行
  - 刷新
- 群组任务(分为两个状态： 控制下游群组的状态 | 不控制下游群组的状态)
  - 下游节点状态更新
  - 下游节点状态不更新

### 问题

当新增节点的时候，后续新增的节点的 dispatch 状态会晚于 useEffect

### 冒烟逻辑测试

1. 任务调度是否正常执行， 调度状态是否正常
2. 组件接受的数据是否和 state 中的数据状态保持一致
3. 任务新增是否用重新刷新
4. 组件移除，依赖组件是否刷新
5. 任务属性更新是否会刷新
6. 任务是否按照依赖关系正常执行



## 3.0版本
1. 管理模块状态，并支持组件间共享状态
2. 获取依赖的组件的状态
3. 模块状态改变了，通知所有的下游响应式函数进行执行
4. 修改模块状态

- 视图渲染，脏检测机制
- 状态更新批处理机制
- 依赖包的缩减

#### 思考
1. 响应式函数、状态组件、管道
2. reset一个watcher， 用户需要感知到上层是在执行reset
3. (局部状态怎么融合， 怎么合并)[https://img.alicdn.com/tfs/TB1TAoIh_M11u4jSZPxXXahcXXa-974-520.png]
  - 可以通过定义新的rdxNode类型来达到目的
4. 和reducer怎么融合
  - 可以通过定义新的rdxNode类型来达到目的
5. 检测到环的方式怎么处理

### 依赖收集
- 声明式收集
- 自动化收集
  - mobx
  - vue
  - recoil
  - concent
  - https://github.com/nx-js/observer-util?spm=ata.13261165.0.0.367462b4wTnzlR
  - https://github.com/alloc/wana?spm=ata.13261165.0.0.367462b4wTnzlR



### TODO
- ~~useRdxReaction 支持id和rdxNode两种类型作为依赖条件~~
- utils waitForNone（立即返回加载器）, waitForAll(等待所有依赖执行完成后返回), waitForAny(至少一个依赖更新了), noWait调研
- selctorFamily, atomFamily 设计
- scope and weight 如何接入？
- 环检测后事件流逻辑是否有控制的必要，针对环情况的优化
- 如何结合表单场景, 流的思路 和 常规代码思路结合

### 冒烟逻辑测试
1. atom， watcher， reaction 单独的用例
2. reaction、watcher使用atom，的get 链路
3. reaction、watcher使用atom，的set 链路 和reset链路

### 理论依据
1. 主观输入(用户主动触发的场景)
2. 所有触发任务执行了一次(保证页面是最新的状态触发的)
问题： 