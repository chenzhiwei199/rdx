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
import { ErrorContextInstance, ErrorContextClass } from '../../hooks/formStatus';

export enum DepsType {
  Relative = 'Relative',
  Absolute = 'Absolute',
}

export interface IAtom {
  dataSource?: any[];
}

export type RuleDetail = (value, context) => Promise<string | undefined>;
export interface IFromItemBase<T> extends IFieldDefine {
  xProps?: Partial<T>;
  visible?: boolean;
  disabled?: boolean;
  dataSource?: any[];
  status?: Status;
  errorMsg?: string;
  formErrorMsg?: string[];
  require?: boolean
  rules?: RuleDetail[];
}
export interface IModel {
  value?: any;
  dataSource?: any[];
  visible?: boolean;
  disabled?: boolean;
  xProps?: {
    // 其他属性
    [key: string]: any;
  };
}
export type IFromItem<T> = IFromItemBase<T> & {
  children?: ReactNode;
};

export type IRdxFormItem<T> = IFromItemBase<T> & {
  children?: ReactNode;
  deps?: { id: string; type?: DepsType }[];
  firstRender?: boolean;
  reaction?: MixedTask<IModel, IModel[], IFromItemBase<T>>;
  defaultVisible?: boolean;
  defaultDisabled?: boolean;
  compute?: (
    value: any,
    context: DataContext<IModel, IModel[], IFromItemBase<T>>
  ) => void;
  default?: any;
};

function isFunc(a: any) {
  return typeof a === 'function';
}
export function getDefaultValue(
  defaultValue: any,
  disabled: boolean = false,
  dataSource?: any[]
) {
  return {
    value: isFunc(defaultValue) ? defaultValue() : defaultValue,
    disabled: disabled,
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
    compute,
    defaultVisible,
    firstRender = true,
    disabled,
    default: defaultV,
    ...rest
  } = props;
  const { paths } = useContext(PathContextInstance);
  const atomReaction = reaction && useCallback(reaction, []);
  const errorStore = useContext<ErrorContextClass>(ErrorContextInstance);
  const id = [...paths, name].join('.');
  const atomRender = useCallback(
    (context: DataContext<IModel, IModel[], IFromItemBase<T>>) => {
      const {
        id,
        status,
        errorMsg,
        refreshView,
        value,
        next,
        moduleConfig,
      } = context;
      if (status === Status.FirstRender && !firstRender) {
        return <></>;
      }
      const { xProps, ...rest } = value;
      const {
        xProps: xModuleProps,
        rules = [],
        require,
        ...restMoudleConfig
      } = moduleConfig;
      async function validator(value, context) {
        let infos = [];
        for (let rule of rules) {
          infos.push(await rule(value, context));
        }
        return infos;
      }

      const newProps = {
        ...restMoudleConfig,
        ...rest,
        ...xModuleProps,
        ...xProps,
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
      } as any;

      return (
        <FromItem<T>
          rules={rules}
          xProps={newProps}
          status={status}
          require={require}
          formErrorMsg={errorStore.getErrors(id)}
          errorMsg={errorMsg}
        >
          {children}
        </FromItem>
      );
    },
    []
  );

  return (
    <RdxView<IModel, IModel[], IFromItemBase<T>, any>
      id={id}
      reactionType={
        isPromise(reaction) ? ReactionType.Async : ReactionType.Sync
      }
      defaultValue={getDefaultValue(defaultV, disabled, dataSource)}
      moduleConfig={{
        name,
        type,
        dataSource,
        ...rest,
        visible: defaultVisible === undefined ? true : false,
      }}
      areEqualForTask={(type, preConfig, nextConfig) => {
        if (type === CompareType.ExecuteTask) {
          return true;
        } else {
          return Object.keys(nextConfig).every((key) => {
            return shallowEqual(preConfig[key], nextConfig[key]);
          });
        }
      }}
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
const FormStyleItemLabel = styled.div<{ layoutType: LayoutType, require: boolean; }>`
  line-height: 28px;
  vertical-align: top;
  color: #666666;
  display: inline-block;
  text-align: right;
  padding-right: 12px;
  line-height: 28px;
  ::before {
    display: ${props => props.require ? 'visible': 'none'};
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
export const FromItem = <T extends Object>(props: IFromItem<T>) => {
  const {
    children,
    formErrorMsg,
    status,
    errorMsg,
    require,
    xProps = {} as any,
  } = props;
  const {
    title,
    dataSource,
    disabled,
    visible,
    name,
    type,
    xComponent,
    desc,
    rules,
    
    ...rest
  } = xProps;
  const Cmp = getRegistry().fields[xComponent || type];
  const transformProps = {
    name,
    status,
    loading: status === Status.Waiting || status === Status.Running,
    error: status === Status.Error,
    ...rest,
    children,
  } as any;
  if (dataSource) {
    transformProps.dataSource = dataSource;
  }
  if (disabled) {
    transformProps.disabled = disabled;
  }
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
            {Cmp && <Cmp {...transformProps} />}
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

function getWidth(col: number) {
  const colspan = (col / 24) * 100;
  return `${colspan}%`;
}
