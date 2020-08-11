import { checkTaskChange } from '../utils';
import { ActionType, TargetType } from '../RdxContext/interface';
import { useEffect, useRef, useContext } from 'react';
import { BaseModuleProps, useForceUpdate } from '../RdxView/View';
import {
  ShareContextClass,
  ShareContextInstance,
} from '../RdxContext/shareContext';
import { StateUpdateType, IRdxView } from '../global';

function getTaskInfo<IModel, IRelyModel, IAction>(
  props: BaseModuleProps<IModel, IRelyModel, IAction>
): IRdxView<IModel, IRelyModel, IAction> {
  const { context, ...rest } = props;
  return rest;
}
/**
 * 任务绑定
 * @param props
 */
export function useTaskBinding<IModel, IRelyModel, IAction>(
  props: BaseModuleProps<IModel, IRelyModel, IAction>
) {
  useTaskInit(props);
  useTaskUpdate(props);
  useStateUpdate(
    props.id,
    useContext(ShareContextInstance),
    StateUpdateType.State
  );
}
export function useTaskInit<IModel, IRelyModel, IAction>(
  props: BaseModuleProps<IModel, IRelyModel, IAction>
) {
  const { context, id } = props;
  const taskInfo = getTaskInfo<IModel, IRelyModel, IAction>(props);
  useEffect(() => {
    if (context.parentMounted) {
      context.addOrUpdateTask(id, taskInfo, {
        notifyTask: true,
        notifyView: true,
      });
    } else {
      context.udpateState(id, ActionType.Update, TargetType.TasksMap, taskInfo);
      context.queue.add(id);
    }
    return () => {
      context.udpateState(id, ActionType.Remove, TargetType.TasksMap);
    };
  }, []);
}

export function useMount() {
  const mount = useRef(false);
  useEffect(() => {
    mount.current = true;
  }, []);
  return mount;
}

export function useTaskUpdate<IModel, IRelyModel, IAction>(
  nextProps: BaseModuleProps<IModel, IRelyModel, IAction>
) {
  const {
    context,
    reaction: model,
    scope,
    deps: depsIds,
    id,
    areEqualForTask,
  } = nextProps;

  const mount = useMount();
  useEffect(() => {
    if (mount.current) {
      // 如果task变化，则新增节点，并删除之前的节点
      const taskInfo = getTaskInfo<IModel, IRelyModel, IAction>(nextProps);

      if (!context.tasksMap.get(id)) {
        context.removeTask(id);
        context.addOrUpdateTask(id, taskInfo, {
          notifyTask: true,
          notifyView: false,
        });
      } else {
        const preTaskInfo = context.tasksMap.get(id);
        // 节点信息修改，task需要刷新
        const isTaskChange = checkTaskChange(preTaskInfo, taskInfo);
        context.addOrUpdateTask(id, taskInfo, {
          notifyTask: areEqualForTask
            ? !areEqualForTask(taskInfo, nextProps)
            : isTaskChange,
          notifyView: isTaskChange,
        });
      }
    }
  }, [mount.current, id, depsIds, model, scope]);
}

export const ForceRender = 'ForceRender';

export function useStateUpdate<IModel, IRelyModel>(
  id: string,
  context: ShareContextClass<IModel, IRelyModel>,
  type: StateUpdateType
) {
  const forceUpdate = useForceUpdate();
  useEffect(() => {
    const eventKey = id + '----' + type;
    context.eventEmitter.on(eventKey, () => {
      forceUpdate();
    });
    return () => {
      context.eventEmitter.off(eventKey);
    };
  }, []);
}
