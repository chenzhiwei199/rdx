import React, { useContext, ReactNode } from 'react';
import { Status } from '@czwcode/rdx';
import styled, { CSSProperties } from 'styled-components';
import { IFieldDefine, BaseType, SuspectType } from '../../global';
import { getRegistry } from '../../core/registry';
import { PathContextInstance } from '../../hooks/pathContext';
import {
  LayoutType,
  LayoutContext,
  LayoutContextInstance,
  LabelTextAlign,
  createLayout,
} from '../../hooks/formLayoutHoooks';
import { isError } from '../../utils/validator';
import {
  ErrorContextInstance,
  ErrorContextClass,
  GlobalErrorContextInstance,
} from '../../hooks/formStatus';
import { FormContextInstance } from '../../hooks/formContext';
import {
  useRdxFormComputeLoader,
  useRdxFormStateContext,
} from '../../hooks/rdxStateFormHooks';
import { getEmptyValue } from '../../utils/functions';
import {
  IModel,
  IRdxFormComputeGet,
  IRdxFormComputeSet,
  RuleDetail,
} from './types';
import { Tooltip } from '../Tooltip';
export * from './types';
export enum DepsType {
  Relative = 'Relative',
  Absolute = 'Absolute',
}

export interface IAtom {
  dataSource?: any[];
}

export enum State {
  Loading = 'loading',
  Error = 'error',
}

export interface IFormBlock<T> {
  base: IFormBlockInner;
  formTypes: IFormTypes<BaseType>;
  componentProps: IPenetrate<T>;
  layoutProps?: {
    span?: number;
  };
}
export interface IFormTypes<T extends BaseType> {
  // 组件类型
  xComponent?: string;
  // 数据类型
  type: T;
}
// 组件消费属性
export interface IPenetrate<T> {
  // 是否可用
  disabled?: boolean;
  // 状态
  state: State;
  // 透传组件属性
  others?: Partial<T>;
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
  // 表单提示信息
  tips?: string;
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

export type IRdxFormItemExternal = {};
export type IRdxFormItem<ISource, T extends BaseType> = {
  // 子节点
  children?: ReactNode;
  // 响应式函数
  get?: IRdxFormComputeGet<SuspectType<T>, ISource>;
  // 计算值
  set?: IRdxFormComputeSet<SuspectType<T>, ISource>;
  // 默认的可见状态
  defaultVisible?: boolean;
  // // 默认的不可用状态
  // defaultDisabled?: boolean;
  // // 数据源
  // dataSource?: any[];
  // 默认值
  default?: any;
  // virtual
  virtual?: boolean;
  // 唯一id
  name?: string;
  // 校验规则
  rules?: RuleDetail[];
  // 组件透传属性
  componentProps?: { [key: string]: any };
} & IFormBlockBase &
  IFormTypes<T>;

export function getDefaultValue(
  defaultValue: any,
  defaultVisible: boolean = true,
  componentProps?: any
) {
  return {
    value: defaultValue,
    visible: defaultVisible,
    componentProps,
  };
}
export function useVirtual(props: { virtual?: boolean }) {
  const { virtual } = useContext(FormContextInstance);
  return virtual || props.virtual;
}

// export const RdxFormItem = <ISource extends any>(
//   props: IRdxFormItem<ISource, BaseType>
// ) => <BaseRdxFormItem<ISource, BaseType> {...props} />;

export const RdxFormItem = <ISource, T extends BaseType>(
  props: IRdxFormItem<ISource, T>
) => {
  const {
    name,
    get,
    componentProps,
    title,
    desc,
    tips,
    require,
    children,
    type,
    xComponent,
    set,
    defaultVisible,
    default: defaultV,
    rules = [],
  } = props;
  const { paths } = useContext(PathContextInstance);
  const currentVirtual = useVirtual(props);
  const errorStore = useContext<ErrorContextClass>(GlobalErrorContextInstance);
  const id = [...paths, name].join('.');
  // !
  const defaultValue = getDefaultValue(
    getEmptyValue({
      type,
      default: defaultV,
    }),
    defaultVisible,
    componentProps
  );
  const rdxContext = useRdxFormStateContext();

  const [value = defaultValue, next, context] = useRdxFormComputeLoader<
    IModel<SuspectType<T>>
  >({
    virtual: currentVirtual,
    id: id,
    get: get
      ? (config) => {
          return get({
            ...config,
            value:
              rdxContext.hasTask(id) && rdxContext.isTaskReady(id)
                ? rdxContext.getTaskStateById(id)
                : defaultValue,
          });
        }
      : () => {
          return context.value;
        },
    set: set
      ? (config, newValue) => {
          return set({ ...config, value: context.value }, newValue);
        }
      : ({ set }, newValue) => {
          set(id, newValue);
        },
  });
  const { status, errorMsg } = context;
  async function validator(value, context) {
    let infos = [];
    for (let rule of rules) {
      infos.push(await rule(value, context));
    }
    return infos;
  }

  let state = undefined;
  if (status === Status.Waiting || status === Status.Running) {
    state = State.Loading;
  } else if (Status.Error === status) {
    state = State.Error;
  }

  const { visible, value: v } = value;
  // 如果父级是数组，则使用父级的name
  // 表格场景，强制不能嵌套，因为布局是由表格掌控的
  return (
    <FormContextInstance.Provider
      value={{ name: name, virtual: currentVirtual }}
    >
      <FormItem<T>
        base={{
          title,
          desc,
          tips,
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
          // 状态中的组件属性，优先级高于外部传进来的
          ...value.componentProps,
          value: v,
          state,
          onChange: (v) => {
            const newValue = { ...value, value: v };
            next(newValue);
            validator(v, context)
              .then((errors) => {
                errorStore.setErrors(id, errors);
              })
              .catch((error) => {
                console.error('规则执行错误', error.toString());
              });
          },
        }}
      >
        {children}
      </FormItem>
    </FormContextInstance.Provider>
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
  col?: number;
}>`
  line-height: 28px;
  /* flex:  */
`;
const FormItemWrapper = styled.div<{
  useMargin: boolean;
}>`
  margin-bottom: ${(props) => {
    console.log('props.useMargin', props.useMargin);
    return props.useMargin ? 12 : 0;
  }}px;
`;
export const FormItem = <T extends Object>(
  props: IFormBlock<T> & { children?: React.ReactNode }
) => {
  const { children, formTypes, base, componentProps, layoutProps } = props;
  const { type, xComponent } = formTypes;
  const {
    visible = true,
    title,
    desc,
    tips,
    formErrorMsg,
    require,
    errorMsg,
  } = base;
  const Cmp = getRegistry().fields[xComponent || type];
  const { containerStyle, labelStyle, contentStyle } = createLayout(
    layoutProps && layoutProps.span
  );
  return (
    <>
      {visible && (
        <FormItemWrapper
          useMargin={type !== BaseType.Object}
          style={containerStyle}
          className='rdx-form-item'
        >
          {title && (
            <FormStyleItemLabel
              style={labelStyle}
              require={require}
              className='rdx-form-item-label'
            >
              {title}
              {tips && (
                // @ts-ignore
                <Tooltip
                  trigger={
                    <span
                      style={{
                        display: 'inline-flex',
                        // alignItems: 'center',
                        verticalAlign: 'text-top',
                        paddingLeft: '6px',
                      }}
                    >
                      <svg
                        // t='1602216301118'
                        // className='icon'
                        viewBox='0 0 1024 1024'
                        version='1.1'
                        xmlns='http://www.w3.org/2000/svg'
                        // p-id='1385'
                        width='14'
                        height='14'
                      >
                        <path
                          d='M512 1024C229.069 1024 0 794.829 0 512S229.069 0 512 0c282.931 0 512 229.171 512 512s-229.069 512-512 512z m-0.034-93.12c231.073 0.066 418.98-187.942 418.913-418.914 0.067-230.904-187.84-418.912-418.913-418.912-231.005 0-418.912 187.907-418.912 418.912 0 231.073 187.907 418.98 418.912 418.913z m-46.511-651.607h93.09v93.09h-93.09v-93.09z m93.09 465.445h-93.09V465.455h93.09v279.263z'
                          fill='#8a8a8a'
                          p-id='1386'
                        ></path>
                      </svg>
                    </span>
                  }
                >
                  <div>{tips}</div>
                </Tooltip>
              )}
            </FormStyleItemLabel>
          )}
          <FormStyleItemContent
            style={contentStyle}
            className='rdx-form-item-content'
          >
            {Cmp && (
              <Cmp {...filterVaild(componentProps)} children={children} />
            )}
            <div style={{ color: '#999999' }}>{desc}</div>
            <div style={{ color: 'red' }}>
              {isError(formErrorMsg) && formErrorMsg}
              {errorMsg && JSON.stringify(errorMsg)}
            </div>
          </FormStyleItemContent>
        </FormItemWrapper>
      )}
    </>
  );
};

function filterVaild(v: { [key: string]: any }) {
  let newV = {} as any;
  Object.keys(v).forEach((key) => {
    if (v[key] !== undefined) {
      newV[key] = v[key];
    }
  });
  return newV;
}
