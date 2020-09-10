import { ShareContextClass } from "../RdxContext/shareContext";
import { Status, isPromise, RdxNode } from "..";
import { ActionType, TargetType } from "../RdxContext/interface";
import { DataModel } from "./types";

/**
 * @template IModel
 * @param {string} id
 * @param {ShareContextClass<any, any>} context
 * @param {DataModel<IModel>} value
 */
export function loadDefualtValue<IModel>(
  id: string,
  context: ShareContextClass<any, any>,
  value: DataModel<IModel>
) {
  function markWaiting() {
    context.setTaskStatus(id, { value: Status.Waiting });
  }
  function updateState(value: any) {
    context.udpateState(id, ActionType.Update, TargetType.TaskState, value);
  }
  // 静态数据
  if (!isPromise(value) && !(value instanceof RdxNode)) {
    updateState(value);
  }
  // promise数据
  if (isPromise(value)) {
    markWaiting();
  }

  // rdxNode
  if (value instanceof RdxNode) {
    // 确保节点加载
    if (!context.hasTask(value.getId())) {
      context.addOrUpdateTask(value.getId(), value.load(context));
    }
    if (context.isTaskReady(value.getId())) {
      updateState(context.getTaskState(value.getId()));
    } else {
      markWaiting();
    }
  }
}

