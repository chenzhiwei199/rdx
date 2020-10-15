### 表单生成器
- 组件注册
- 组件渲染
- 布局渲染


### 问题
- path如何在父子组件中传递
- 异步方法如何序列化？async ?
- 数据格式的转化，内外维护的状态不一样，需要转化为外部的
- 受控方式的时候，需要重新执行一遍任务吗？
- 数组形式不好实现

### 例子
- 布局方式
  - single column布局
  - 
- 表单类型
- 联动能力
- 受控状态
- 校验能力
- 数组配置
- visible 和disabled能力


### 树编辑器
### 颜色选择器

### feature 考虑下怎么支持rangePicker
```jsx
import React from 'react'
import ReactDOM from 'react-dom'
import {
  SchemaForm,
  SchemaMarkupField as Field,
  createFormActions
} from '@formily/next'
import { DatePicker } from '@formily/next-components'
import '@alifd/next/dist/next.css'

const App = () => {
  return (
    <SchemaForm components={{ RangePicker: DatePicker.RangePicker }}>
      <Field x-component="RangePicker" title="RangePicker" name="[start,end]" />
    </SchemaForm>
  )
}

ReactDOM.render(<App />, document.getElementById('root'))
```

