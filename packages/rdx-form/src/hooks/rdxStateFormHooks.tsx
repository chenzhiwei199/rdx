import {
  createRdxHooks,
  createRdxStateContext,
  RdxNodeType,
} from '@czwcode/rdx';
import { useContext } from 'react';
export const FormRdxStateContext = createRdxStateContext();
const defaultHooks = createRdxHooks(FormRdxStateContext);
export const useRdxFormAtom = defaultHooks.useRdxAtom;
export const useRdxFormAtomLoader = defaultHooks.useRdxAtomLoader;
export const useRdxFormCompute = defaultHooks.useRdxCompute;
export const useRdxFormComputeLoader = defaultHooks.useRdxComputeLoader;
export const useRdxFormGlboalState = defaultHooks.useRdxGlboalState;
export const useRdxFormGlobalContext = defaultHooks.useRdxGlobalContext;
export const useRdxFormRefrence = defaultHooks.useRdxRefrence;
export const useRdxFormState = defaultHooks.useRdxState;
export const useRdxFormValue = defaultHooks.useRdxValue;
export const useRdxFormStateLoader = defaultHooks.useRdxStateLoader;
export const useRdxFormValueLoader = defaultHooks.useRdxValueLoader;
export const useRdxFormLoading = defaultHooks.useRdxLoading;
export const useRdxFormValueByDependencies =
  defaultHooks.useRdxValueByDependencies;
export const useRdxFormSetter = defaultHooks.useRdxSetter;

export const useRdxFormStateContext = () => {
  return useContext(FormRdxStateContext);
};

export const useRdxFormReset = () => {
  const context = useRdxFormStateContext();
  return () => {
    const tasks = context.getTasks();
    let atomTasks = [];
    for (let key of tasks.keys()) {
      if (tasks.get(key).type === RdxNodeType.Atom) {
        atomTasks.push(key);
      }
    }
    context.reset(atomTasks);
  };
};
