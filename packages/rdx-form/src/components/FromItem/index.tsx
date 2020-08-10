import React, { useCallback, useContext, ReactNode } from 'react';
import {
  RdxView,
  DataContext,
  CompareType,
  MixedTask,
  ReactionType,
  Status,
} from '@czwcode/rdx';
import shallowEqual from 'shallowequal';
import styled, { CSSProperties } from 'styled-components';
import { isPromise } from '../../utils';
import { IFieldDefine } from '../../global';
import { getRegistry } from '../../core/registry';
import { PathContextInstance } from '../../hooks/pathContext';
import {
  LayoutType,
  LayoutContext,
  LayoutContextInstance,
} from '../../hooks/formLayoutHoooks';
import { isError } from '../../utils/validator';
import {
  ErrorContextInstance,
  ErrorContextClass,
} from '../../hooks/formStatus';

export enum DepsType {
  Relative = 'Relative',
  Absolute = 'Absolute',
}

export interface IAtom {
  dataSource?: any[];
}

export type RuleDetail = (value, context) => Promise<string | undefined>;
export enum State {
  None = 1,
  Loading = 2,
  Error = 3,
}

export interface IFormBlock<T> {
  base: IFormBlockInner;
  formTypes: IFormTypes;
  componentProps: IPenetrate<T>;
}
export interface IFormTypes {
  // 组件类型
  xComponent?: string;
  // 数据类型
  type?: string;
}
// 组件消费属性
export interface IPenetrate<T> {
  // 是否可用
  disabled?: boolean;
  // 状态
  state: State;
  // 透传组件属性
  xProps?: Partial<T>;
  // 组件透传数据源
  dataSource?: any[];
  // 组件值
  value: any;
  // 回调方法
  onChange: (v: any) => void;
}
export interface IFormBlockInner extends IFormBlockBase {
 // 响应函数中的错误信息
 errorMsg?: string;
 // 表单中的错误信息
 formErrorMsg?: string[];
}
export interface IFormBlockBase {
  // block标题
  title?: string;
  // block详情
  desc?: string;
  // 展示必填标记
  require?: boolean;
  // 是否可见
  visible?: boolean;
}
export interface IFromItemBase<T> extends IFieldDefine {
  // 外部透传属性
  xProps?: Partial<T>;
  // 是否可见
  visible?: boolean;
  // 是否disabled
  disabled?: boolean;
  // 数据源
  dataSource?: any[];
  // 状态
  status?: Status;
  // 响应函数中的错误信息
  errorMsg?: string;
  // 表单中的错误信息
  formErrorMsg?: string[];
  // 展示必填标记
  require?: boolean;
  // 校验规则
  rules?: RuleDetail[];
}
/**
 * 视图状态
 */
export interface IModel<T> {
  value?: any;
  dataSource?: any[];
  visible?: boolean;
  disabled?: boolean;
  componentProps?: Partial<T>
}
// export type IFromItem<T> = IFromItemBase<T> & {
//   children?: ReactNode;
// };

export type IRdxFormItem<T> = {
  // 子节点
  children?: ReactNode;
  // 依赖关系
  deps?: { id: string; type?: DepsType }[];
  // 响应式函数
  reaction?: MixedTask<IModel<T>, IModel<T>[]>;
  // 默认的可见状态
  defaultVisible?: boolean;
  // 默认的不可用状态
  defaultDisabled?: boolean;
  // 计算值
  compute?: (value: any, context: DataContext<IModel<T>, IModel<T>[]>) => void;
  // 默认值
  default?: any;
  // 唯一id
  name?: string;
  // 校验规则
  rules?: RuleDetail[];
  // 数据源
  dataSource?: any[];
  // 组件透传属性
  componentProps?: Partial<T>;
} & IFormBlockBase & IFormTypes;

function isFunc(a: any) {
  return typeof a === 'function';
}
export function getDefaultValue(
  defaultValue: any,
  disabled: boolean = false,
  defaultVisible: boolean = true,
  dataSource?: any[]
) {
  return {
    value: isFunc(defaultValue) ? defaultValue() : defaultValue,
    disabled: disabled,
    visible: defaultVisible,
    dataSource,
  };
}
export const RdxFormItem = <T extends Object>(props: IRdxFormItem<T>) => {
  const {
    name,
    reaction = (context) => {},
    deps = [],
    dataSource,
    children,
    type,
    xComponent,
    compute,
    defaultVisible,
    defaultDisabled,
    default: defaultV,
    ...rest
  } = props;
  const { paths } = useContext(PathContextInstance);
  const errorStore = useContext<ErrorContextClass>(ErrorContextInstance);
  const id = [...paths, name].join('.');
  const visible = defaultVisible === undefined ? true : false;
  const formItemProps = {
    name,
    type,
    dataSource,
    ...rest,
  };
  const atomReaction =
    reaction &&
    useCallback(reaction, [...Object.values(formItemProps), reaction]);
  const atomRender = useCallback(
    (context: DataContext<IModel<T>, IModel<T>[]>) => {
      const { id, status, errorMsg, refreshView, value, next } = context;
      const {
        componentProps,
        rules = [],
        require,
        title,
        desc,
      } = formItemProps;
      async function validator(value, context) {
        let infos = [];
        for (let rule of rules) {
          infos.push(await rule(value, context));
        }
        return infos;
      }

      let state = State.None;
      if (status === Status.Waiting || status === Status.Running) {
        state = State.Loading;
      } else if (Status.Error === status) {
        state = State.Error;
      }

      const { visible, disabled, value: v, dataSource, componentProps: componentPropsFromValue } = value;
      return (
        <FromItem<T>
          base={{
            title,
            desc,
            require,
            visible,
            formErrorMsg: errorStore.getErrors(id),
            errorMsg: errorMsg,
          }}
          formTypes={{
            type,
            xComponent,
          }}
          componentProps={{
            ...componentProps,
            // 状态中的组件属性，优先级高于外部传进来的
            ...componentPropsFromValue,
            dataSource,
            disabled,
            value: v,
            state,
            onChange: (v) => {
              const newValue = { ...value, value: v };
              compute ? compute(v, context) : next(newValue);
              validator(v, context)
                .then((errors) => {
                  errorStore.setErrors(id, errors);
                  refreshView();
                })
                .catch((error) => {
                  console.error('规则执行错误', error.toString());
                });
            },
          }}
        >
          {children}
        </FromItem>
      );
    },
    [...Object.values(formItemProps)]
  );

  return (
    <RdxView<IModel<T>, IModel<T>[], any>
      id={id}
      reactionType={
        isPromise(reaction) ? ReactionType.Async : ReactionType.Sync
      }
      defaultValue={getDefaultValue(defaultV, defaultDisabled, defaultVisible, dataSource, )}
      reaction={atomReaction}
      deps={deps.map((item) => ({
        id:
          item.type === DepsType.Absolute
            ? item.id
            : [...paths, item.id].join('.'),
      }))}
      render={atomRender}
    ></RdxView>
  );
};
function getDisplayType(props: LayoutContext) {
  const { layoutType } = props;
  let style = {} as CSSProperties;
  if (!layoutType) {
    style.display = 'block';
  } else if (layoutType === LayoutType.Grid) {
    style.display = 'block';
  } else {
    style.display = 'inline-block';
  }
  return style;
}
const FormStyleItemLabel = styled.div<{
  layoutType: LayoutType;
  require: boolean;
}>`
  line-height: 28px;
  vertical-align: top;
  color: #666666;
  display: inline-block;
  text-align: right;
  padding-right: 12px;
  line-height: 28px;
  ::before {
    display: ${(props) => (props.require ? 'visible' : 'none')};
    content: '*';
    color: #ff3000;
    margin-right: 4px;
  }
`;
const FormStyleItemContent = styled.div<{
  layoutType: LayoutType;
  col?: number;
}>`
  line-height: 28px;
  /* flex:  */
`;
const FormItemWrapper = styled.div<{ isGrid?: boolean; col?: number }>`
  margin-bottom: 16px;
`;
export const FromItem = <T extends Object>(
  props: IFormBlock<T> & { children?: React.ReactNode }
) => {
  const { children, formTypes, base, componentProps } = props;
  const { type, xComponent } = formTypes;
  const { visible, title, desc, formErrorMsg, require } = base;
  const Cmp = getRegistry().fields[xComponent || type];
  const layoutContext = useContext<LayoutContext>(LayoutContextInstance);
  const { labelCol, wrapCol, layoutType, labelTextAlign } = layoutContext;
  const isGrid = layoutType === LayoutType.Grid;
  const gridStyle = {
    display: 'flex',
  };
  const wrapInlineStyle = {
    display: 'inline',
  };

  return (
    <>
      {visible && (
        <FormItemWrapper
          isGrid={isGrid}
          style={
            layoutType ? (isGrid ? gridStyle : wrapInlineStyle) : undefined
          }
          className='rdx-form-item'
        >
          {title && (
            <FormStyleItemLabel
              style={{
                flex: `0 0 ${getWidth(labelCol)}`,
                textAlign: labelTextAlign,
              }}
              require={require}
              layoutType={layoutType}
              className='rdx-form-item-label'
            >
              {title}
            </FormStyleItemLabel>
          )}
          <FormStyleItemContent
            style={{
              ...getDisplayType(layoutContext),
              flex: `0 0 ${getWidth(wrapCol)}`,
            }}
            layoutType={layoutType}
            className='rdx-form-item-content'
          >
            {Cmp && <Cmp {...filterVaild(componentProps)} children={children} />}
            <div style={{ color: '#999999' }}>{desc}</div>
            <div style={{ color: 'red' }}>
              {isError(formErrorMsg) && formErrorMsg}
              {/* {status === Status.Error && errorMsg} */}
            </div>
          </FormStyleItemContent>
        </FormItemWrapper>
      )}
    </>
  );
};

function filterVaild(v: { [key: string]: any}) {
  let newV = {} as any
  Object.keys(v).forEach(key => {
    if(v[key] !== undefined) {
      newV[key] = v[key]
    }
  })
  return newV
}
function getWidth(col: number) {
  const colspan = (col / 24) * 100;
  return `${colspan}%`;
}
