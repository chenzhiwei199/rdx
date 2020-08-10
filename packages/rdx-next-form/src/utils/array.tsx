import { getEmptyValue, IFieldDefine } from '@czwcode/rdx-form';
export function createMutators(value: any, onChange: any, infos: IFieldDefine) {
  const switchItem = (arr: any[], preIndex: number, nextIndex: number) => {
    arr = arr.slice(0);
    const temp = arr[preIndex];
    arr[preIndex] = arr[nextIndex];
    arr[nextIndex] = temp;
    return arr;
  };
  const remove = (index) => {
    const cloneValue = value.slice(0);
    cloneValue.splice(index, 1);
    onChange(cloneValue);
  };
  const moveUp = (index) => {
    if (index - 1 < 0) {
      return;
    }
    const newValue = switchItem(value, index - 1, index);
    onChange(newValue);
  };
  const moveDown = (index) => {
    if (index + 1 > value.length) {
      return;
    }
    onChange(switchItem(value, index, index + 1));
  };
  const add = () => {
    onChange([...value, getEmptyValue(infos)]);
  };
  return {
    add,
    moveDown,
    moveUp,
    remove,
    switchItem,
  };
}
