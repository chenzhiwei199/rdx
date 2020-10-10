import { ShareContextClass } from '../RdxContext/shareContext';
import { RdxNode, RdxNode2 } from './base';
import { ActionType, TargetType } from '../RdxContext/interface';
import { DataModel } from './types';
import { RdxWatcherNode } from './RdxWatcher';
import { isPromise } from '../utils';

/**
 * @template GModel
 * @param {string} id
 * @param {ShareContextClass<any, any>} context
 * @param {DataModel<GModel>} value
 * @returns 如果加载正确的值， 则返回值，否则返回null
 */
export function loadDefaultValue<GModel>(
  context: ShareContextClass,
  value: DataModel<GModel>
): { ready: boolean; data: GModel | Promise<GModel> | null } {
  // 静态数据
  if (!isPromise(value) && !(value instanceof RdxNode)) {
    return { ready: true, data: value as GModel };
  }
  // promise数据
  if (isPromise(value)) {
    return { ready: false, data: value as Promise<GModel> };
  }

  // RdxNode
  if (value instanceof RdxNode) {
    // 加载节点
    if (!context.hasTask(value.getId())) {
      value.load(context);
    }
    if (context.isTaskReady(value.getId())) {
      return { ready: true, data: context.getTaskStateById(value.getId()) };
    } else {
      return { ready: false, data: null };
    }
  }
}
