import { CompareType, checkTaskChange } from '../utils';
import { ActionType, TargetType } from '../RdxContext/interface';
import { useEffect, useRef } from 'react';
import { BaseModuleProps, useForceUpdate } from '../RdxView/View';
import { usePrevious } from './base';
import { ShareContextClass } from '../RdxContext/shareContext';
import { StateUpdateType } from '../global';

function getTaskInfo<IModel, IRelyModel, IModuleConfig, IAction>(
  props: BaseModuleProps<IModel, IRelyModel, IModuleConfig, IAction>
) {
  const { context, ...rest } = props;
  return rest;
}
export function useTaskInit<IModel, IRelyModel, IModuleConfig, IAction>(
  props: BaseModuleProps<IModel, IRelyModel, IModuleConfig, IAction>
) {
  const { context, id } = props;
  const taskInfo = getTaskInfo<IModel, IRelyModel, IModuleConfig, IAction>(
    props
  );
  useEffect(() => {
    if (context.parentMounted) {
      context.addOrUpdateTask(id, taskInfo, {
        notifyTask: true,
        notifyView: true
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

export function useTaskUpdate<IModel, IRelyModel, IModuleConfig, IAction>(
  nextProps: BaseModuleProps<IModel, IRelyModel, IModuleConfig, IAction>
) {
  const {
    context,
    reaction: model,
    moduleConfig: modelConfig,
    scope,
    deps: depsIds,
    id,
  } = nextProps;
  
  const mount = useMount();
  useEffect(() => {
    if (mount.current) {
      // 如果task变化，则新增节点，并删除之前的节点
      const taskInfo = getTaskInfo<IModel, IRelyModel, IModuleConfig, IAction>(
        nextProps
        );
       
      if (!context.tasksMap.get(id)) {
        context.removeTask(id);
        context.addOrUpdateTask(id, taskInfo, {
          notifyTask: true,
          notifyView: false,
        });
      } else {
        const preTaskInfo = context.tasksMap.get(id)
        // 节点信息修改，task需要刷新
        const isTaskChange = checkTaskChange(
          preTaskInfo,
          taskInfo,
          CompareType.ExecuteTask
        );
        const isViewChange = checkTaskChange(
          preTaskInfo,
          taskInfo,
          CompareType.ViewShouldUpdate
        );
        context.addOrUpdateTask(id, taskInfo, {
          notifyTask: isTaskChange,
          notifyView: isViewChange,
        });
      }
    }
  }, [mount.current, id, depsIds, model, scope, modelConfig]);
}

export const ForceRender = 'ForceRender';

export function useStateUpdate<IModel, IRelyModel, IModuleConfig>(
  id: string,
  context: ShareContextClass<IModel, IRelyModel, IModuleConfig>,
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
