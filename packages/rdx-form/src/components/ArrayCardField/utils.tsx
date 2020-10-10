import { getEmptyValue, getChlidFieldInfo } from '../../utils/functions';
import { useContext } from 'react';
import { FormContextInstance } from '../../hooks/formContext';
import { PathContextInstance } from '../../hooks/pathContext';
import { getWatcherId } from '../FromItem';
import { useRdxFormStateContext } from '../../hooks/rdxStateFormHooks';
import { BaseType } from '../../global';
export function createArrayMutators(onChange: any, children) {
  const id = useFormId();
  const context = useRdxFormStateContext();
  const getValue = () => {
    return (
      (context.getTaskStateById(getWatcherId(id)) || ({} as any)).value || []
    );
  };
  const getAtomValue = () => {
    return (context.getTaskStateById(id) || ({} as any)).value || [];
  };
  const fieldDefine = getChlidFieldInfo(children);

  const switchState = (preIndex, nextIndex) => {
    const isObject = fieldDefine.type === BaseType.Object;
    const rule = isObject
      ? new RegExp(`^${id}.${preIndex}\.(.+)`)
      : new RegExp(`^${id}.${preIndex}$`);
    const vaildKeys = Array.from(context.getTasks().keys()).filter((key) =>
      rule.test(key)
    );
    let effectKeys = new Set<string>();
    vaildKeys.forEach((key) => {
      const preKey = key;
      const nextKey = isObject
        ? [id, nextIndex, key.match(rule)[1]].join('.')
        : [id, nextIndex].join('.');
      console.log('preKey: ', preKey);
      console.log('nextKey: ', nextKey);
      let temp = context.getTaskStateById(preKey);
      context.setTaskState(preKey, context.getTaskStateById(nextKey));
      context.setTaskState(nextKey, temp);
      effectKeys.add(preKey);
      effectKeys.add(nextKey);
    });
    return Array.from(effectKeys);
  };
  const switchItem = (preIndex, nextIndex) => {
    const effectKeys = switchState(preIndex, nextIndex).map((key) => ({
      key: key,
      downStreamOnly: true,
    }));
    context.batchTriggerSchedule(effectKeys);
  };
  const remove = (index) => {
    let effectKeys = [];
    for (
      let tempIndex = index;
      tempIndex < getValue().length - 1;
      tempIndex++
    ) {
      effectKeys = effectKeys.concat(switchState(tempIndex, tempIndex + 1));
    }
    context.batchTriggerSchedule(
      effectKeys.map((key) => ({
        key: key,
        downStreamOnly: true,
      }))
    );
    onChange(getAtomValue().slice(0, getAtomValue().length - 1));

    // 什么时机，缩减数组的个数
  };
  const moveUp = (index) => {
    if (index - 1 < 0) {
      return;
    }
    switchItem(index - 1, index);
  };
  const moveDown = (index) => {
    if (index + 1 > getValue().length) {
      return;
    }
    switchItem(index, index + 1);
  };
  const add = () => {
    onChange([...getValue(), getEmptyValue(fieldDefine)]);
  };
  return {
    add,
    moveDown,
    moveUp,
    remove,
    switchItem,
    // moveItem
  };
}

export const useFormId = () => {
  const { paths = [] } = useContext(PathContextInstance);
  const { name } = useContext(FormContextInstance);
  const id = [...paths, name].join('.');
  return id;
};
