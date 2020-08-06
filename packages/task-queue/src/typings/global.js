export var ReactionType;
(function (ReactionType) {
    ReactionType[ReactionType["Sync"] = 1] = "Sync";
    ReactionType[ReactionType["Async"] = 2] = "Async";
})(ReactionType || (ReactionType = {}));
export var TASK_PROCESS_TYPE;
(function (TASK_PROCESS_TYPE) {
    // (触发节点 下游节点) (当前运行图状态) (重复节点) (新图节点)
    TASK_PROCESS_TYPE[TASK_PROCESS_TYPE["UPDATE_RUNNING_GRAPH"] = 1] = "UPDATE_RUNNING_GRAPH";
    // 触发节点 触发状态
    TASK_PROCESS_TYPE[TASK_PROCESS_TYPE["STATUS_CHANGE"] = 2] = "STATUS_CHANGE";
})(TASK_PROCESS_TYPE || (TASK_PROCESS_TYPE = {}));
export var TaskEventType;
(function (TaskEventType) {
    TaskEventType["ProcessRunningGraph"] = "ProcessRunningGraph";
    TaskEventType["TaskChange"] = "TaskChange";
    TaskEventType["Init"] = "Init";
    TaskEventType["RdxContextInit"] = "RdxContextInit";
    TaskEventType["EventTrigger"] = "EventTrigger";
    TaskEventType["BatchEventTrigger"] = "BatchEventTrigger";
    TaskEventType["StatusChange"] = "StatusChange";
    TaskEventType["StateChange"] = "StateChange";
})(TaskEventType || (TaskEventType = {}));
