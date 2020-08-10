export var POINT_RELEVANT_STATUS;
(function (POINT_RELEVANT_STATUS) {
    POINT_RELEVANT_STATUS[POINT_RELEVANT_STATUS["SAME_POINT"] = 1] = "SAME_POINT";
    POINT_RELEVANT_STATUS[POINT_RELEVANT_STATUS["UP_STREAM"] = 2] = "UP_STREAM";
    POINT_RELEVANT_STATUS[POINT_RELEVANT_STATUS["DOWN_STREAM"] = 2] = "DOWN_STREAM";
    POINT_RELEVANT_STATUS[POINT_RELEVANT_STATUS["IRRELEVANT"] = 4] = "IRRELEVANT";
})(POINT_RELEVANT_STATUS || (POINT_RELEVANT_STATUS = {}));
export var NodeStatus;
(function (NodeStatus) {
    NodeStatus["Running"] = "RUNNING";
    NodeStatus["Finish"] = "FINISH";
    NodeStatus["Waiting"] = "WATTING";
    NodeStatus["IDeal"] = "NONE";
    NodeStatus["Error"] = "ERROR";
})(NodeStatus || (NodeStatus = {}));
