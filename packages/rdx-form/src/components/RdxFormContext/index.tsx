import React, { useRef } from 'react';
import { RdxContext, ShareContextClass, Base } from '@czwcode/rdx';
import { IModel } from '../FromItem';
import { set, get } from '../../utils';
import {
  ErrorContextInstance,
  ErrorContextClass,
} from '../../hooks/formStatus';
export interface IRdxFormContext {
  children: React.ReactNode;
  state?: any;
  initializeState?: any;
  onChange?: (state: any) => void;
}

class FormStore implements Base<IModel> {
  clone(): Base<IModel> {
    return new FormStore({
      state: this.state,
      runningState: this.runningState,
    });
  }
  merge(scope: string): void {
    throw new Error('Method not implemented.');
  }
  // 实际数据
  state: { [key: string]: any } = {};
  // 运行时逻辑
  runningState: { [key: string]: IModel } = {};
  constructor(v: { state: any; runningState: any }) {
    this.state = v.state;
    this.runningState = v.runningState as any;
  }
  remove(key: string, scope?: string) {
    set(this.state, key, undefined);
    delete this.runningState[key];
  }
  update(key: string, value: IModel, scope?: string): void {
    const { value: currentV, ...rest } = value;
    set(this.state, key, currentV);
    this.runningState[key] = rest;
  }
  get(key: string, scope?: string): IModel | null {
    const value = get(this.state, key);
    const others = this.runningState[key];
    return value === undefined && others === undefined
      ? undefined
      : {
          disabled: false,
          value: value,
          ...others,
        };
  }
  getAll(): any {
    return {
      state: this.state,
      runningState: this.runningState,
    };
  }
}
const RdxFormContext = (props: IRdxFormContext) => {
  const { state, children, initializeState, onChange } = props;
  const innerStateRef = useRef<FormStore>(
    new FormStore({ state: {}, runningState: {} })
  );
  const contextRef = useRef<ShareContextClass<IModel, unknown, Object>>(null);
  const errorContextRef = useRef<ErrorContextClass>(new ErrorContextClass());
  let isUnderControl = false;
  // 判断受控与非受控
  if (state) {
    isUnderControl = true;
  }
  return (
    <RdxContext
      withRef={contextRef}
      state={
        isUnderControl
          ? {
              state: state,
              runningState: innerStateRef.current.runningState,
            }
          : undefined
      }
      initializeState={{ state: initializeState || {}, runningState: {} }}
      shouldUpdate={(preValue: IModel, nextValue: IModel) => {
        if (!preValue || !nextValue) {
          return true;
        }
        return preValue.value !== nextValue.value;
      }}
      createStore={(data) => {
        return new FormStore(data) as any;
      }}
      onChange={(state, stateInstance) => {
        innerStateRef.current = stateInstance;
        onChange && onChange(state.state);
      }}
    >
      <ErrorContextInstance.Provider value={errorContextRef.current}>
        {children}
      </ErrorContextInstance.Provider>
    </RdxContext>
  );
};

function isObj(o: any) {
  return typeof o === 'object';
}

export default RdxFormContext;
