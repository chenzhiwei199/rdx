import React__default, {
  useContext,
  createContext,
  useEffect,
  useState,
  useRef,
  createElement,
  useCallback,
} from 'react';
import styled from 'styled-components';
import ReactDOM from 'react-dom';
import {
  Table,
  Icon,
  Button,
  Input,
  Select,
  Radio,
  Switch,
  Checkbox,
} from '@alifd/next';

/*! *****************************************************************************
Copyright (c) Microsoft Corporation. All rights reserved.
Licensed under the Apache License, Version 2.0 (the "License"); you may not use
this file except in compliance with the License. You may obtain a copy of the
License at http://www.apache.org/licenses/LICENSE-2.0

THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
MERCHANTABLITY OR NON-INFRINGEMENT.

See the Apache Version 2.0 License for specific language governing permissions
and limitations under the License.
***************************************************************************** */

function __rest(s, e) {
  var t = {};
  for (var p in s)
    if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
      t[p] = s[p];
  if (s != null && typeof Object.getOwnPropertySymbols === 'function')
    for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
      if (
        e.indexOf(p[i]) < 0 &&
        Object.prototype.propertyIsEnumerable.call(s, p[i])
      )
        t[p[i]] = s[p[i]];
    }
  return t;
}

function __awaiter(thisArg, _arguments, P, generator) {
  return new (P || (P = Promise))(function(resolve, reject) {
    function fulfilled(value) {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    }
    function rejected(value) {
      try {
        step(generator['throw'](value));
      } catch (e) {
        reject(e);
      }
    }
    function step(result) {
      result.done
        ? resolve(result.value)
        : new P(function(resolve) {
            resolve(result.value);
          }).then(fulfilled, rejected);
    }
    step((generator = generator.apply(thisArg, _arguments || [])).next());
  });
}

const registry = {
  fields: {},
};
const getRegistry = () => {
  return {
    fields: registry.fields,
  };
};
const cleanRegistry = () => {
  registry.fields = {};
};
function registryRdxFormComponent(key, component) {
  registry.fields[key] = component;
}
function registryRdxFormComponents(components) {
  Object.keys(components).forEach((key) => {
    registryRdxFormComponent(key, components[key]);
  });
}

const PathContextInstance = React__default.createContext({
  paths: [],
  virtual: false,
  isArray: false,
  setArrayItem: () => {},
});
const createMutators = (value, onChange, index, defaultValue) => ({
  push: () => {
    onChange(value.concat({}));
  },
  change: (index, key, v) => {
    onChange([
      ...value.slice(0, index),
      Object.assign(Object.assign({}, value[index]), { [key]: v }),
      ...value.slice(index + 1),
    ]);
  },
});

const ObjectField = (props) => {
  const { children, paths = [], name } = props;
  const { paths: parentPaths = [], isArray = false } = useContext(
    PathContextInstance
  );
  return React__default.createElement(
    PathContextInstance.Provider,
    {
      value: {
        paths: isArray
          ? [...parentPaths, ...paths]
          : [...parentPaths, ...paths, name],
      },
    },
    children
  );
};

function renderChildren(itemRef, children) {
  const { type, children: childrenInfo } = itemRef;
  let currentChildren = React__default.createElement(
    React__default.Fragment,
    null
  );
  if (type === 'object') {
    currentChildren = childrenInfo.map((item) =>
      React__default.cloneElement(
        item.child,
        Object.assign(Object.assign({}, item.child.props), {
          key: item.child.props.name,
        })
      )
    );
  } else {
    currentChildren = React__default.cloneElement(
      children,
      Object.assign(Object.assign({}, children.props), {
        key: children.props.name,
      })
    );
  }
  return currentChildren;
}

function isFunction(a) {
  return typeof a === 'function';
}

function isPromise(obj) {
  return (
    !!obj &&
    (typeof obj === 'object' || typeof obj === 'function') &&
    typeof obj.then === 'function'
  );
}
function getEmptyValue(fieldDefine) {
  const { type, default: defaultValue } = fieldDefine;
  if (defaultValue !== undefined) {
    return isFunction(defaultValue) ? defaultValue() : defaultValue;
  }
  if (type === 'string') {
    return '';
  }
  if (type === 'array') {
    return [];
  }
  if (type === 'object') {
    return {};
  }
  if (type === 'number') {
    return 0;
  }
}
function getChlidFieldInfos(children) {
  let itemRefs = [];
  React__default.Children.forEach(children, (child, index) => {
    const { name, title, type, xComponent } = child.props;
    itemRefs.push({
      title,
      type,
      name,
      child: child,
      xComponent,
    });
  });
  return itemRefs;
}
function getChlidFieldInfo(children) {
  let itemRef = {};
  React__default.Children.forEach(children, (child, index) => {
    const {
      title,
      name,
      type,
      xComponent,
      children,
      default: defaultValue,
    } = child.props;
    if (index === 0) {
      if (type === 'object') {
        itemRef = {
          title,
          type,
          default: defaultValue,
          name,
          xComponent,
          children: getChlidFieldInfos(children),
        };
      } else {
        itemRef = {
          title,
          type,
          default: defaultValue,
          name,
          xComponent,
        };
      }
    }
  });
  return itemRef;
}
const toArr = (val) => (Array.isArray(val) ? val : val ? [val] : []);
const normalizeCol = (col, defaultValue) => {
  if (!col) {
    return defaultValue;
  } else {
    return typeof col === 'object' ? col : { span: Number(col) };
  }
};
/**
 *
 * @param fn {Function}   实际要执行的函数
 * @param delay {Number}  延迟时间，也就是阈值，单位是毫秒（ms）
 *
 * @return {Function}     返回一个“去弹跳”了的函数
 */
function debounce(fn, delay) {
  // 定时器，用来 setTimeout
  let timer;
  // 返回一个函数，这个函数会在一个时间区间结束后的 delay 毫秒时执行 fn 函数
  return function() {
    // 保存函数调用时的上下文和参数，传递给 fn
    // tslint:disable-next-statement
    let context = this;
    let args = arguments;
    // 每次这个返回的函数被调用，就清除定时器，以保证不执行 fn
    clearTimeout(timer);
    // 当返回的函数被最后一次调用后（也就是用户停止了某个连续的操作），
    // 再过 delay 毫秒就执行 fn
    timer = setTimeout(() => {
      fn.apply(context, args);
    }, delay);
  };
}
function get(o, path, defaultValue) {
  const keys = `${path}`.split('.');
  if (keys && keys.length > 0) {
    let temp = o;
    let index = 0;
    for (let key of keys) {
      if (index === keys.length - 1) {
        return temp[key] === undefined ? defaultValue : temp[key];
      } else if (temp[key] === undefined) {
        return defaultValue;
      } else {
        temp = temp[key];
      }
      index++;
    }
  } else {
    return o;
  }
}
function set(target = {}, path, value) {
  const paths = `${path}`.split('.');
  if (paths && paths.length > 0) {
    let temp = target;
    let index = 0;
    for (let path of paths) {
      if (index === paths.length - 1) {
        temp[path] = value;
      } else {
        if (temp[path] === undefined) {
          temp[path] = {};
        }
        temp = temp[path];
      }
      index++;
    }
  }
  return target;
}

const Array$1 = (props) => {
  const { value = [], onChange, children, name } = props;
  const { paths: parentPaths = [] } = useContext(PathContextInstance);
  const itemRef = getChlidFieldInfo(children);
  return React__default.createElement(
    StyleCard,
    null,
    value.length === 0 &&
      React__default.createElement(
        StyleEmpty,
        null,
        React__default.createElement('img', {
          src: '//img.alicdn.com/tfs/TB1cVncKAzoK1RjSZFlXXai4VXa-184-152.svg',
          style: { background: 'transparent' },
        })
      ),
    value.map((item, index) => {
      const currentPaths = [...parentPaths, name, index.toString()];
      return React__default.createElement(
        PathContextInstance.Provider,
        {
          value: {
            paths: currentPaths,
          },
        },
        renderChildren(itemRef, children)
      );
    }),
    React__default.createElement(
      StyledAdd,
      {
        onClick: () => {
          onChange([...value, getEmptyValue(itemRef)]);
        },
      },
      '\u6DFB\u52A0\u4E00\u4E2A\u6570\u7EC4'
    )
  );
};
const StyleEmpty = styled.div`
  display: flex;
  flex-direction: center;
  align-items: center;
  justify-content: center;
`;
const StyleCard = styled.div`
  box-shadow: none;
  border-width: 1px;
  border-style: solid;
  padding: 12px;
  border-color: rgb(238, 238, 238);
  border-image: initial;
`;
const StyledItemHeader = styled.div`
  position: relative;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #e6e7eb;
  margin-top: 8px;
  margin-bottom: 0;
  height: 40px;
  line-height: 40px;
`;
const StyledAdd = styled.div`
  margin-top: 20px;
  margin-bottom: 3px;
  display: flex;
  cursor: pointer;
  -webkit-box-pack: center;
  justify-content: center;
  box-shadow: rgba(0, 0, 0, 0.1) 1px 1px 4px 0px;
  background: rgb(255, 255, 255);
  padding: 10px 0px;
`;

var LayoutType;
(function(LayoutType) {
  LayoutType['Grid'] = 'grid';
  LayoutType['Inline'] = 'inline';
})(LayoutType || (LayoutType = {}));
const LayoutContextInstance = createContext({});

const FormLayout = (props) => {
  const {
    children,
    labelCol = 8,
    wrapCol = 16,
    labelTextAlign = 'right',
  } = props;
  return React__default.createElement(
    LayoutContextInstance.Provider,
    {
      value: {
        layoutType: LayoutType.Grid,
        labelCol: labelCol,
        wrapCol: wrapCol,
        labelTextAlign: labelTextAlign,
      },
    },
    children
  );
};

var POINT_RELEVANT_STATUS;
(function(POINT_RELEVANT_STATUS) {
  POINT_RELEVANT_STATUS[(POINT_RELEVANT_STATUS['SAME_POINT'] = 1)] =
    'SAME_POINT';
  POINT_RELEVANT_STATUS[(POINT_RELEVANT_STATUS['UP_STREAM'] = 2)] = 'UP_STREAM';
  POINT_RELEVANT_STATUS[(POINT_RELEVANT_STATUS['DOWN_STREAM'] = 2)] =
    'DOWN_STREAM';
  POINT_RELEVANT_STATUS[(POINT_RELEVANT_STATUS['IRRELEVANT'] = 4)] =
    'IRRELEVANT';
})(POINT_RELEVANT_STATUS || (POINT_RELEVANT_STATUS = {}));
var NodeStatus;
(function(NodeStatus) {
  NodeStatus['Running'] = 'RUNNING';
  NodeStatus['Finish'] = 'FINISH';
  NodeStatus['Waiting'] = 'WATTING';
  NodeStatus['IDeal'] = 'NONE';
  NodeStatus['Error'] = 'ERROR';
})(NodeStatus || (NodeStatus = {}));

/**
 * 根据依赖，需要发送通知的下游节点
 * @param config
 */
function createDeliversMap(config) {
  const deliversMap = new Map();
  for (const item of config) {
    for (const dep of item.deps || []) {
      const currentRelations = deliversMap.get(dep.id);
      if (currentRelations) {
        currentRelations.push(item.key);
      } else {
        deliversMap.set(dep.id, [item.key]);
      }
    }
  }
  return deliversMap;
}
// console.log(createDeliversMap([{key: '1', deps: undefined }, { key: '2', deps: ['1']}, {key: '3', deps: ['2']}]));
function createConfigMap(config) {
  return config.reduce((currentMap, item) => {
    currentMap.set(item.key, item);
    return currentMap;
  }, new Map());
}
function normalizeSingle2Arr(point) {
  if (!Array.isArray(point)) {
    return [point];
  } else {
    return point;
  }
}
function arr2Map(source, getKey) {
  const m = new Map();
  source.forEach((item) => {
    const key = getKey(item);
    m.set(key, item);
  });
  return m;
}
function union(source, byKey = (t) => t) {
  const arr = [];
  const m = new Map();
  source.forEach((item) => {
    const key = byKey(item);
    if (!m.has(key)) {
      arr.push(item);
      m.set(key, item);
    }
  });
  return arr;
}

const GLOBAL_DEPENDENCE_SCOPE = '*';
class BaseGraph {
  constructor(config) {
    /**
     * 根据派发关系来找到所有经过的节点
     * 找到当前点关联的所有点(排除除触发点以外作用域外的点，和 WeakPoint)
     * @param triggerPoints
     * @param createDeliversMap
     */
    this.getAllPointsByPointByScope = (scope) => {
      const vaildConfig = this.getConfigByScope(scope);
      const validConfigDevlierMap = createDeliversMap(vaildConfig);
      return (triggerPoints) => {
        const recordSet = new Set();
        const traverseDirtySet = new Set();
        function traverse(triggerPoints) {
          triggerPoints.forEach((triggerPoint) => {
            if (!triggerPoint.downStreamOnly) {
              if (!recordSet.has(triggerPoint.key)) {
                recordSet.add(triggerPoint.key);
              }
            }
            const currentDeliverConfig = validConfigDevlierMap.get(
              triggerPoint.key
            );
            if (currentDeliverConfig) {
              const willTraversePoint = currentDeliverConfig
                .filter((item) => !traverseDirtySet.has(item))
                .map((item) => ({ key: item, downStreamOnly: false }));
              traverseDirtySet.add(triggerPoint.key);
              traverse(willTraversePoint);
            }
          });
        }
        traverse(triggerPoints);
        return Array.from(recordSet);
      };
    };
    this.updateConfig(config);
  }
  sinks() {
    return this.config
      .filter((item) => (item.deps || []).length === 0)
      .map((item) => item.key);
  }
  successors(v) {
    return this.deliverMap.get(v) || [];
  }
  nodes() {
    return this.config.map((item) => item.key);
  }
  hasEdge(v, w) {
    return (this.deliverMap.get(v) || []).includes(w);
  }
  findCycles() {
    return this.tarjan().filter((cmpt) => {
      return (
        cmpt.length > 1 || (cmpt.length === 1 && this.hasEdge(cmpt[0], cmpt[0]))
      );
    });
  }
  edgeValue(v, w) {
    this.deliverMap;
  }
  inEdges(key) {
    return (this.configMap.get(key).deps || []).map((item) => ({
      v: item.id,
      w: key,
      value: this.configMap.get(key).deps.find((dep) => dep.id === item.id)
        .value,
    }));
  }
  edge(v, w) {
    return (
      (this.configMap.get(w).deps || []).find((item) => item.id === v) || {}
    ).value;
  }
  outEdges(key) {
    return (this.deliverMap.get(key) || []).map((item) => ({
      v: key,
      w: item,
    }));
  }
  removeEdge(v, w) {
    const newConfig = this.config.map((item) => {
      if (item.key === w) {
        return Object.assign(Object.assign({}, item), {
          deps: item.deps.filter((dep) => dep.id !== v),
        });
      } else {
        return Object.assign({}, item);
      }
    });
    this.updateConfig(newConfig);
    return newConfig;
  }
  removeNode(key) {
    // 删除节点
    this.config = this.config
      .filter((item) => item.key !== key)
      .map((item) => {
        return Object.assign(Object.assign({}, item), {
          deps: (item.deps || []).filter((dep) => dep.id !== key),
        });
      });
    this.updateConfig(this.config);
  }
  dfs(k, visited, stack) {
    visited.add(k);
    stack.push(k);
    this.successors(k).forEach((successorKey) => {
      if (!visited.has(successorKey)) {
        this.dfs(successorKey, visited, stack);
      } else {
        stack.push(k);
      }
    });
  }
  getRelationConfig(keys) {
    const config = this.config.filter((item) => keys.includes(item.key));
    return this.cleanInVaildDeps(config);
  }
  isAcyclic() {
    let visited = new Set();
    let stack = [];
    this.sinks().forEach((k) => {
      this.dfs(k, visited, stack);
    });
    return visited.size < stack.length;
  }
  tarjan() {
    var index = 0;
    var stack = [];
    var visited = {}; // node id -> { onStack, lowlink, index }
    var results = [];
    function isVisited(w) {
      return Boolean(visited[w]);
    }
    const dfs = (v) => {
      var entry = (visited[v] = {
        onStack: true,
        lowlink: index,
        index: index++,
      });
      stack.push(v);
      this.successors(v).forEach(function(w) {
        if (!isVisited(w)) {
          dfs(w);
          entry.lowlink = Math.min(entry.lowlink, visited[w].lowlink);
        } else if (visited[w].onStack) {
          entry.lowlink = Math.min(entry.lowlink, visited[w].index);
        }
      });
      if (entry.lowlink === entry.index) {
        var cmpt = [];
        var w;
        do {
          w = stack.pop();
          visited[w].onStack = false;
          cmpt.push(w);
        } while (v !== w);
        results.push(cmpt);
      }
    };
    this.nodes().forEach(function(v) {
      if (!isVisited(v)) {
        dfs(v);
      }
    });
    return results;
  }
  updateConfig(config) {
    this.config = config;
    this.configMap = createConfigMap(config);
    this.deliverMap = createDeliversMap(config);
  }
  getConfig() {
    return this.config;
  }
  cleanInVaildDeps(config) {
    const configMap = createConfigMap(config);
    return config.map((item) =>
      Object.assign(Object.assign({}, item), {
        deps: (item.deps || []).filter((dep) => configMap.get(dep.id)),
      })
    );
  }
  getConfigByScope(scope) {
    let config;
    if (!scope || scope === GLOBAL_DEPENDENCE_SCOPE) {
      config = this.config;
    } else {
      config = this.config.filter((item) => item.scope === scope);
    }
    return this.cleanInVaildDeps(config);
  }
  /**
   * 根据派发关系来找到所有经过的节点
   * 找到当前点关联的所有点(排除除触发点以外作用域外的点)
   * @param newTriggerPoints
   * @param createDeliversMap
   */
  getAllPointsByPoints(triggerPoints) {
    // 非数组，处理成数组
    // @ts-ignore
    const newTriggerPoints = normalizeSingle2Arr(triggerPoints);
    // 去除无效点
    const validPoints = [];
    newTriggerPoints.forEach((cursor, index) => {
      const newCursor = Object.assign({}, cursor);
      const findIndex = validPoints.findIndex(
        (item) => item.key === cursor.key
      );
      if (findIndex !== -1) {
        if (!cursor.scope || cursor.scope === GLOBAL_DEPENDENCE_SCOPE) {
          newCursor.scope = GLOBAL_DEPENDENCE_SCOPE;
        }
        if (!cursor.downStreamOnly) {
          newCursor.downStreamOnly = false;
        }
      }
      validPoints.push(newCursor);
    });
    // 字段分类
    const classficationPointsByScope = new Map();
    validPoints.forEach((item) => {
      const getPointsByScope = classficationPointsByScope.get(item.scope);
      if (classficationPointsByScope.has(item.scope)) {
        getPointsByScope.push(item);
      } else {
        classficationPointsByScope.set(item.scope, [item]);
      }
    });
    let allPoints = [];
    Array.from(classficationPointsByScope.keys()).forEach((scope) => {
      allPoints = allPoints.concat(
        this.getAllPointsByPointByScope(scope)(
          classficationPointsByScope.get(scope)
        )
      );
    });
    // @ts-ignore
    allPoints = union(allPoints, (p) => {
      return p;
    });
    return allPoints;
  }
}

class RunningMap {
  constructor(points) {
    this.statusMap = new Map();
    this.points = points;
  }
  createStatusMap() {
    this.points.forEach((point) => {
      this.statusMap.set(point, NodeStatus.IDeal);
    });
  }
  hasPoint(key) {
    return this.points.includes(key);
  }
  setStatus(key, status) {
    this.statusMap.set(key, status);
  }
  batchSetStatus(key, status) {
    const keys = normalizeSingle2Arr(key);
    keys.forEach((current) => {
      this.setStatus(current, status);
    });
  }
  isRunning() {
    return this.getNotFinishPoints().length > 0;
  }
  isFinish(key) {
    if (this.hasPoint(key)) {
      const status = this.statusMap.get(key);
      return !(status === NodeStatus.Waiting || status === NodeStatus.Running);
    } else {
      return true;
    }
  }
  isPointRunning(key) {
    if (this.hasPoint(key)) {
      const status = this.statusMap.get(key);
      return status === NodeStatus.Running;
    } else {
      return false;
    }
  }
  getAllPointsWtihStatus() {
    return this.points.map((p) => ({
      key: p,
      status: this.statusMap.get(p),
    }));
  }
  getNotFinishPoints() {
    return this.points
      .filter((key) => {
        return !this.isFinish(key);
      })
      .map((item) => ({
        key: item,
        status: this.statusMap.get(item),
      }));
  }
  getRunningPoints() {
    return this.points
      .filter((key) => {
        return this.hasPoint(key) && this.isPointRunning(key);
      })
      .map((item) => ({
        key: item,
        status: this.statusMap.get(item),
      }));
  }
}

class Graph extends BaseGraph {
  constructor(config) {
    super(config);
    this.runningGraph = new RunningMap(config.map((item) => item.key));
  }
  udpateRunningGraph(points) {
    this.runningGraph = new RunningMap(points.map((item) => item.key));
  }
  isRunning() {
    return this.runningGraph.isRunning();
  }
  setRunning(key) {
    if (key) {
      this.runningGraph.setStatus(key, NodeStatus.Running);
    }
  }
  setPending(key) {
    if (key) {
      this.runningGraph.batchSetStatus(key, NodeStatus.Waiting);
    }
  }
  getAllPointWithStatus() {
    return this.runningGraph.getAllPointsWtihStatus();
  }
  setFinish(key) {
    if (key) {
      this.runningGraph.batchSetStatus(key, NodeStatus.Finish);
    }
  }
  getCurrentPoints(triggerPoints) {
    // 1 运行的图
    const notFinishPoints = this.getNotFinishPoints();
    // 2 触发的新图
    const allTriggerPoints = this.getAllPointsByPoints(triggerPoints);
    // 有运行状态的的节点
    // 3 图点的合并
    const afterUnionGraph = union(
      [...notFinishPoints.map((item) => item.key), ...allTriggerPoints],
      (a) => a
    );
    // 4 返回图
    return afterUnionGraph;
  }
  getNotFinishPoints() {
    return this.runningGraph.getNotFinishPoints();
  }
  getRunningPoints() {
    return this.runningGraph.getRunningPoints();
  }
}

const END = 'i am i end subscribe, hahaha';
const createGraphByGraphAndCircle = (graph, circle) => {
  const config = graph.getRelationConfig(circle);
  return new Graph(config);
};
const findNotMaxWidgetEdge = (edges) => {
  let max = -1;
  let maxIndex = -1;
  edges.forEach((item, index) => {
    const { value } = item;
    if (value.weight > max) {
      max = value.weight;
      maxIndex = index;
    }
  });
  if (maxIndex === -1) {
    return null;
  } else {
    return [...edges.slice(0, maxIndex), ...edges.slice(maxIndex + 1)];
  }
};
const findSameArray = (sourceArr, targetArr) => {
  return targetArr.find((item) => sourceArr.includes(item));
};
var ReasonType;
(function(ReasonType) {
  ReasonType['TriggerInnEdge'] = 'TriggerInnEdge';
  ReasonType['SmallWeight'] = 'SmallWeight';
  ReasonType['WeightEqualAndNotFirst'] = 'WeightEqualAndNotFirst';
})(ReasonType || (ReasonType = {}));
function cleanConfig(p, triggerKey, donwStream) {
  const edgeCuts = [];
  const graph = new Graph(graphAdapter(p));
  try {
    removeCircleEdges(graph, graph, triggerKey, edgeCuts);
    if (donwStream === true) {
      graph.removeNode(triggerKey);
    }
  } catch (error) {
    console.error(error);
  }
  return {
    points: graph.config,
    edgeCuts: edgeCuts,
  };
}
function removeCircleEdges(rootGraph, currentGraph, triggerKey, edgeCuts) {
  const circles = rootGraph.findCycles();
  if (circles.length === 0) {
    return;
  }
  // 找路径，找到环的切入点
  const path = currentGraph.getAllPointsByPoints({
    key: triggerKey,
    downStreamOnly: false,
  });
  circles.forEach((circle) => {
    let circleTriggerKey = findSameArray(circle, path);
    if (!circleTriggerKey) {
      circleTriggerKey = circle[0];
    }
    // 构建环的图
    const circleGraph = createGraphByGraphAndCircle(currentGraph, circle);
    const edgeCut = {
      circle: circle,
      edges: [],
    };
    function removeEdge({ v, w }) {
      circleGraph.removeEdge(v, w);
      rootGraph.removeEdge(v, w);
    }
    function appendEdgeCuts(edges) {
      edgeCut.edges = [...edgeCut.edges, ...edges];
    }
    // 清理环里面所有入度
    const inEdges = circleGraph.inEdges(circleTriggerKey);
    if (inEdges) {
      const inEdgesInCircle = inEdges;
      inEdgesInCircle.forEach((edge) => {
        removeEdge(edge);
      });
      appendEdgeCuts(
        inEdgesInCircle.map((item) => ({
          source: item.v,
          target: item.w,
          reasonType: ReasonType.TriggerInnEdge,
        }))
      );
    }
    // 留下权重最高的边
    const outEdges = rootGraph.outEdges(circleTriggerKey);
    if (outEdges) {
      const willCutEdges = findNotMaxWidgetEdge(
        outEdges.map((item) =>
          Object.assign(Object.assign({}, item), {
            value: rootGraph.edge(item.v, item.w),
          })
        )
      );
      if (willCutEdges) {
        willCutEdges.forEach((edge) => {
          removeEdge(edge);
        });
        appendEdgeCuts(
          willCutEdges.map((item) => ({
            source: item.v,
            target: item.w,
            reasonType: ReasonType.SmallWeight,
          }))
        );
      } else {
        const others = outEdges.slice(1);
        others.forEach((edge) => {
          removeEdge(edge);
        });
        appendEdgeCuts(
          others.map((item) => ({
            source: item.v,
            target: item.w,
            reasonType: ReasonType.WeightEqualAndNotFirst,
          }))
        );
      }
    }
    edgeCuts.push(edgeCut);
    removeCircleEdges(rootGraph, circleGraph, circleTriggerKey, edgeCuts);
  });
}
function graphAdapter(pointWithWeight) {
  return pointWithWeight.map((p) => {
    return Object.assign(Object.assign({}, p), {
      deps: (p.deps || []).map((dep) => {
        if (typeof dep === 'string') {
          return {
            id: dep,
          };
        } else {
          const others = __rest(dep, ['id']);
          return {
            id: dep.id,
            value: others,
          };
        }
      }),
    });
  });
}
function point2WithWeightAdapter(pointWithWeight) {
  return pointWithWeight.map((p) => {
    return Object.assign(Object.assign({}, p), {
      id: p.key,
      deps: (p.deps || []).map((dep) => {
        return {
          id: dep.id,
        };
      }),
    });
  });
}
function graphLibAdapter(pointWithWeight) {
  return pointWithWeight.map((p) => {
    return Object.assign(Object.assign({}, p), {
      id: p.key,
      deps: (p.deps || []).map((dep) => {
        if (typeof dep === 'string') {
          return {
            id: dep,
          };
        } else {
          return dep;
        }
      }),
    });
  });
}

class BaseQueue {
  constructor(config) {
    this.config = [];
    this.configMap = new Map();
    this.running = false;
    this.runningId = 'none';
    this.runtimeGraph = new Graph([]);
    this.updateTasks(config);
  }
  updateTasks(config) {
    if (!this.graph) {
      this.graph = new Graph(graphAdapter(config));
    } else {
      this.graph.updateConfig(graphAdapter(config));
    }
    this.config = config.map((item) =>
      Object.assign(Object.assign({}, item), {
        scope: item.scope ? item.scope : GLOBAL_DEPENDENCE_SCOPE,
      })
    );
    this.configMap = createConfigMap(config);
    // 更新全局图
  }
  getFirstAllPoints(scope) {
    const firstPoints = this.getFirstPoints(scope);
    return this.graph.getAllPointsByPoints(
      firstPoints.map((point) => ({ key: point, scope }))
    );
  }
  /**
   *
   * @param config 找到所有起点, 规则: 没有依赖，或者依赖全都不在dfsConfig里面
   */
  getFirstPoints(scope) {
    const startPoints = [];
    // 通过作用于过滤点
    const config = this.graph.getConfigByScope(scope);
    if (config.length === 0) {
      return [];
    }
    // 获取去环节点
    const { points: newPendingPoints } = cleanConfig(
      config.map((item) =>
        Object.assign(Object.assign({}, item), {
          deps: (item.deps || []).map((k) => ({ id: k.id })),
        })
      ),
      config[0].key,
      false
    );
    // 无依赖节点
    for (const item of newPendingPoints) {
      const deps = item.deps || [];
      if (deps.length === 0) {
        startPoints.push(item.key);
      }
    }
    return startPoints;
  }
  getAllPointFired(points) {
    // @ts-ignore
    const newPoints = normalizeSingle2Arr(points);
    // @ts-ignore
    let p = this.graph.getAllPointsByPoints(newPoints);
    return p;
  }
  isRunning() {
    return this.graph.isRunning();
  }
  getIntersectPoints(downStreamPoints) {
    const runningPoints = this.graph.getNotFinishPoints();
    const intersectPoints = downStreamPoints.filter((p) => {
      return runningPoints.some((rp) => rp && rp.key === p);
    });
    return intersectPoints;
  }
  getNotFinishPoints() {
    return this.graph.getNotFinishPoints();
  }
  /**
   * 获取即将要执行任务
   * @param executeTasks
   * @param downstreamOnly
   */
  getPendingPoints(executeTasks) {
    if (!this.graph.isRunning()) {
      return this.graph.getAllPointsByPoints(executeTasks);
    } else {
      return this.graph.getCurrentPoints(executeTasks);
    }
  }
  beforeDeliver(executeTasks) {
    // 数据格式类型统一处理
    // @ts-ignore
    const normalizeExecuteTasks = normalizeSingle2Arr(executeTasks);
    // 获取即将要执行的任务
    let pendingPoints = this.getPendingPoints(normalizeExecuteTasks);
    let downStreamPoints = this.graph.getAllPointsByPoints(
      normalizeExecuteTasks
    );
    // 构建运行时图
    const intersectPoints = this.getIntersectPoints(downStreamPoints);
    const pendingConfig = this.config.filter((rowConfig) =>
      pendingPoints.includes(rowConfig.key)
    );
    // 设置当前任务流的节点状态
    this.graph.udpateRunningGraph(graphAdapter(pendingConfig));
    return { downStreamPoints, intersectPoints, pendingConfig, pendingPoints };
  }
}

var ReactionType;
(function(ReactionType) {
  ReactionType[(ReactionType['Sync'] = 1)] = 'Sync';
  ReactionType[(ReactionType['Async'] = 2)] = 'Async';
})(ReactionType || (ReactionType = {}));
var TASK_PROCESS_TYPE;
(function(TASK_PROCESS_TYPE) {
  // (触发节点 下游节点) (当前运行图状态) (重复节点) (新图节点)
  TASK_PROCESS_TYPE[(TASK_PROCESS_TYPE['UPDATE_RUNNING_GRAPH'] = 1)] =
    'UPDATE_RUNNING_GRAPH';
  // 触发节点 触发状态
  TASK_PROCESS_TYPE[(TASK_PROCESS_TYPE['STATUS_CHANGE'] = 2)] = 'STATUS_CHANGE';
})(TASK_PROCESS_TYPE || (TASK_PROCESS_TYPE = {}));
var TaskEventType;
(function(TaskEventType) {
  TaskEventType['ProcessRunningGraph'] = 'ProcessRunningGraph';
  TaskEventType['TaskChange'] = 'TaskChange';
  TaskEventType['Init'] = 'Init';
  TaskEventType['RdxContextInit'] = 'RdxContextInit';
  TaskEventType['EventTrigger'] = 'EventTrigger';
  TaskEventType['BatchEventTrigger'] = 'BatchEventTrigger';
  TaskEventType['StatusChange'] = 'StatusChange';
  TaskEventType['StateChange'] = 'StateChange';
})(TaskEventType || (TaskEventType = {}));

class ScheduledCore {
  constructor(dataSource) {
    this.inDegree = new Map();
    this.deliverMap = new Map();
    this.taskQueue = [];
    this.update(dataSource);
  }
  /**
   * 更新数据
   */
  update(dataSource) {
    this.dataSource = dataSource;
    // 更新入度表
    this.inDegree = this.createInDegree();
    this.deliverMap = this.createDeliverMap();
  }
  /**
   * 创建下游通知列表
   */
  createDeliverMap() {
    const deliversMap = new Map();
    for (const item of this.dataSource) {
      for (const dep of item.deps || []) {
        const currentRelations = deliversMap.get(dep);
        if (currentRelations) {
          currentRelations.push(item.id);
        } else {
          deliversMap.set(dep, [item.id]);
        }
      }
    }
    return deliversMap;
  }
  /**
   * 创建入度表
   */
  createInDegree() {
    const m = new Map();
    this.dataSource.forEach((row) => {
      const { id, deps } = row;
      m.set(id, (deps || []).length);
    });
    return m;
  }
  /**
   * 终止调用链路
   */
  stop() {
    this.taskQueue.forEach((task) => task.stop());
    this.taskQueue = [];
  }
  canExecute(id) {
    return this.inDegree.get(id) === 0;
  }
  start(callback) {
    // 寻找初始化点
    const inDegreeZero = [];
    Array.from(this.inDegree.keys()).forEach((key) => {
      if (this.canExecute(key)) {
        inDegreeZero.push(key);
      }
    });
    this.batchExecute(inDegreeZero, callback);
  }
  batchExecute(ids, callback) {
    ids.forEach((item) => {
      this.execute(item, callback);
    });
  }
  /**
   * 执行调用链路
   */
  execute(id, callback) {
    const task = new ScheduledTask(
      id,
      () => {
        // 执行完成， 入度减1
        const deliverIds = this.deliverMap.get(id);
        deliverIds.forEach((deliverId) => {
          const currentInDegree = this.inDegree.get(deliverId);
          this.inDegree.set(deliverId, currentInDegree - 1);
        });
        // 找到下游节点，且入度为0的点，通知执行
        const willExcuteIds = deliverIds.filter((item) =>
          this.canExecute(item)
        );
        this.batchExecute(willExcuteIds, callback);
      },
      callback
    );
    this.taskQueue.push(task);
    task.execute();
  }
}
class ScheduledTask {
  constructor(id, next, callback) {
    this.stopSingnal = false;
    this.id = id;
    this.next = next;
    this.callback = callback;
  }
  isStop() {
    return this.stopSingnal;
  }
  stop() {
    this.stopSingnal = true;
  }
  execute() {
    this.callback(this.id, {
      next: () => {
        if (!this.isStop()) {
          this.next();
        }
      },
      scheduledTask: this,
    });
  }
}

class DeliverByCallback extends BaseQueue {
  constructor(
    config,
    preCallback = () => {},
    callback = () => {},
    errorCallback = () => {},
    processChange = () => {}
  ) {
    super(config);
    this.callback = callback;
    this.preCallback = preCallback;
    this.errorCallback = errorCallback;
    this.processChange = processChange;
  }
  getTaskByPoints(p) {
    // @ts-ignore
    const ps = normalizeSingle2Arr(p);
    const newPs = ps.map((currentP) => this.configMap.get(currentP));
    return this.cleanInVaildDeps(newPs);
  }
  cleanInVaildDeps(config) {
    const configMap = arr2Map(config, (a) => a && a.key);
    return config.map((item) =>
      Object.assign(Object.assign({}, item), {
        deps: (item.deps || []).filter((dep) => configMap.get(dep.id)),
      })
    );
  }
  deliver(executeTasks) {
    // downstreamOnly: boolean = false
    // 异常情况兼容
    if (executeTasks.length === 0) {
      return;
    }
    const notFinish = this.graph.getNotFinishPoints();
    const runningPointsMap = arr2Map(notFinish, (item) => item.key);
    let {
      intersectPoints,
      pendingPoints,
      downStreamPoints,
    } = this.beforeDeliver(executeTasks);
    const triggerPoint = executeTasks[executeTasks.length - 1];
    // 补充触发节点
    if (!pendingPoints.includes(triggerPoint.key)) {
      pendingPoints.push(triggerPoint.key);
    }
    const { points: newPendingPoints, edgeCuts } = cleanConfig(
      this.getTaskByPoints(pendingPoints),
      triggerPoint.key,
      triggerPoint.downStreamOnly
    );
    // 传递新触发节点
    this.processChange(TaskEventType.ProcessRunningGraph, {
      graph: this.config,
      preRunningPoints: this.getTaskByPoints(
        notFinish.map((item) => item.key)
      ).map((item) =>
        Object.assign(Object.assign({}, item), {
          status: runningPointsMap[item.key],
        })
      ),
      triggerPoints: point2WithWeightAdapter(executeTasks),
      effectPoints: downStreamPoints,
      conflictPoints: intersectPoints,
      currentAllPoints: this.getTaskByPoints(pendingPoints),
      edgeCutFlow: edgeCuts,
      currentRunningPoints: point2WithWeightAdapter(newPendingPoints),
    });
    // 构建任务处理器
    const endPoint = {
      id: END,
      deps: newPendingPoints.map((item) => item.key),
    };
    // 没有要执行的任务，终止
    if (newPendingPoints.length === 0) {
      return;
    }
    this.graph.setPending(newPendingPoints.map((item) => item.key));
    const runningPointsWithEndPoint = [
      endPoint,
      ...newPendingPoints.map((item) => ({
        id: item.key,
        deps: (item.deps || []).map((dep) => dep.id),
      })),
    ];
    if (!this.scheduledCore) {
      this.scheduledCore = new ScheduledCore(runningPointsWithEndPoint);
    }
    this.scheduledCore.stop();
    this.scheduledCore.update(runningPointsWithEndPoint);
    this.scheduledCore.start(
      this.callbackFunction.bind(this, new Graph(newPendingPoints))
    );
  }
  callbackFunction(runningGraph, currentKey, options) {
    if (currentKey === END) {
      this.callback({ isEnd: true });
    } else {
      this.preCallback(currentKey);
    }
    const { next, scheduledTask } = options;
    const curConfig = this.graph.configMap.get(currentKey);
    const baseTaskInfo = {
      key: currentKey,
      deps: ((curConfig && curConfig.deps) || []).map((item) => ({
        id: item.id,
      })),
    };
    // 记录图的运行时状态
    if (currentKey !== null) {
      const curConfig = this.graph.configMap.get(currentKey);
      const onSuccessProcess = () => {
        if (!scheduledTask.isStop()) {
          // 设置运行结束状态
          this.graph.setFinish(currentKey);
          // 传递状态
          this.processChange(TaskEventType.StatusChange, {
            id: currentKey,
            status: NodeStatus.Finish,
          });
          this.callback({
            currentKey,
            isEnd: false,
          });
          // 执行下一次调度
          next();
        }
      };
      // 当前链路中出现错误了，
      const onErrorProcess = (error) => {
        if (!scheduledTask.isStop()) {
          // 所有没完成的点
          const relationPoints = runningGraph.getAllPointsByPoints({
            key: currentKey,
            downStreamOnly: false,
          });
          const runningPoints = this.getNotFinishPoints();
          const runningPointsMap = arr2Map(runningPoints, (a) => a.key);
          const notFinishPoint = relationPoints.filter((item) =>
            runningPointsMap.has(item)
          );
          // 当前任务组下面所有的点
          notFinishPoint.forEach((p) => {
            this.graph.setFinish(p);
          });
          // 传递错误状态
          this.processChange(TaskEventType.StatusChange, {
            id: currentKey,
            status: NodeStatus.Error,
          });
          this.errorCallback(
            currentKey,
            notFinishPoint,
            error ? error.toString() : '运行错误',
            {
              currentKey,
              isEnd: true,
            }
          );
          // 任务执行失败
          console.error(
            `${currentKey}任务执行失败, depsKeys:${curConfig &&
              curConfig.deps} errorMsg: ${error &&
              error.stack &&
              error.stack.toString()}`
          );
        }
      };
      if (curConfig) {
        if (curConfig.taskType === ReactionType.Sync) {
          try {
            curConfig.task(
              Object.assign(Object.assign({}, baseTaskInfo), {
                isCancel: () => scheduledTask.isStop(),
                next: next,
              })
            );
            onSuccessProcess();
          } catch (error) {
            onErrorProcess(error);
          }
        } else {
          curConfig
            .task(
              Object.assign(Object.assign({}, baseTaskInfo), {
                isCancel: () => scheduledTask.isStop(),
                next: next,
              })
            )
            .then(onSuccessProcess)
            .catch(onErrorProcess);
        }
      }
    }
  }
}

class CommonQueue extends DeliverByCallback {
  constructor() {
    super(...arguments);
    this.getTaskByPoint = (points) => {
      return points.map((point) => {
        const t = this.getTaskByPoints(point.key);
        return {
          key: point.key,
          task: t[0].task,
          scope: point.scope,
        };
      });
    };
    /**
     *
     * @param newWho 谁的下游节点
     */
    this.notifyDownstream = (who) => {
      const newWho = normalizeSingle2Arr(who);
      if (newWho.every((w) => isString(w.key))) {
        this.deliver(newWho);
      } else {
        console.warn('触发节点的格式必须为{ key: string, scope?: string }');
      }
    };
  }
  getTaskByPointWithScope(points, scope) {
    return points.map((point) => {
      const t = this.getTaskByPoints(point);
      return {
        key: point,
        task: t[0].task,
        scope,
      };
    });
  }
  initExecute(scope) {
    const startPoints = this.getFirstPoints(scope);
    this.deliver(this.getTaskByPointWithScope(startPoints, scope));
  }
}
function isString(myVar) {
  return typeof myVar === 'string' || myVar instanceof String;
}

var STATUS_TYPE;
(function(STATUS_TYPE) {
  STATUS_TYPE['BEFORE_TASK_EXECUTE'] = '1';
  STATUS_TYPE['BEFORE_TASK_GROUP_EXECUTE'] = '2';
})(STATUS_TYPE || (STATUS_TYPE = {}));
var TASK_INIT_TYPE;
(function(TASK_INIT_TYPE) {
  TASK_INIT_TYPE['FROM_PROPS'] = '1';
  TASK_INIT_TYPE['FROM_CHILDREN'] = '2';
})(TASK_INIT_TYPE || (TASK_INIT_TYPE = {}));
var RENDER_STATUS;
(function(RENDER_STATUS) {
  RENDER_STATUS['FirstRender'] = 'FIRST_RENDER';
})(RENDER_STATUS || (RENDER_STATUS = {}));
const Status = Object.assign(Object.assign({}, NodeStatus), RENDER_STATUS);
var StateUpdateType;
(function(StateUpdateType) {
  StateUpdateType['ReactionStatus'] = 'ReactionStatus';
  StateUpdateType['State'] = 'State';
})(StateUpdateType || (StateUpdateType = {}));
// 当前节点的state
// states: IStateInfo[];

class BaseMap {
  constructor(v) {
    this.v = v;
  }
  clone() {
    return new BaseMap(this.v);
  }
  merge(scope) {
    throw new Error('Method not implemented.');
  }
  get(key, scope) {
    return this.v.get(key) || null;
  }
  removeAll() {
    this.v.clear();
  }
  remove(rkey, scope) {
    const newMap = new Map();
    Array.from(this.v.keys()).forEach((key) => {
      if (key !== rkey) {
        newMap.set(key, this.v.get(key));
      }
    });
    this.v = newMap;
  }
  update(key, value, scope) {
    const newV = new Map(this.v);
    newV.set(key, value);
    this.v = newV;
    return this;
  }
  getAll() {
    return this.v;
  }
}
class BaseObject {
  constructor(v) {
    this.v = v;
  }
  remove(key, scope) {
    this.v = Object.assign(Object.assign({}, this.v), { [key]: null });
  }
  merge(scope) {
    throw new Error('Method not implemented.');
  }
  clone() {
    return new BaseObject(this.v);
  }
  getAll() {
    return this.v;
  }
  get(key, scope) {
    return this.v[key];
  }
  update(key, value, scope) {
    this.v = Object.assign(Object.assign({}, this.v), { [key]: value });
    return this;
  }
}
class ScopeObject extends BaseObject {
  constructor(v, scopeState) {
    super(v);
    this.scopeEditState = new Map();
    // ?有点问题, 新建，不引用原来对象
    if (scopeState) {
      Array.from(scopeState.keys()).forEach((scope) => {
        this.scopeEditState.set(scope, scopeState.get(scope));
      });
    }
  }
  getCurrentScopeState(scope) {
    return this.scopeEditState.get(scope);
  }
  hasScopeState(scope) {
    return Boolean(this.scopeEditState.get(scope));
  }
  get(key, scope) {
    if (!scope) {
      return super.get(key);
    }
    const scopeState = this.getCurrentScopeState(scope);
    const vInScope = scopeState && scopeState.get(key);
    if (scopeState && vInScope !== undefined) {
      return vInScope;
    } else {
      return super.get(key);
    }
  }
  remove(key, scope) {
    super.remove(key, scope);
    if (this.hasScopeState(scope)) {
      // 清理作用域数据
      this.scopeEditState.set(scope, null);
    }
  }
  merge(scope) {
    const hasScope = this.hasScopeState(scope);
    if (hasScope) {
      // 获取当前作用域的数据
      const currentScopeState = this.getCurrentScopeState(scope);
      // 清理作用域数据
      this.scopeEditState.set(scope, null);
      // 合并到全局数据中
      this.v = Object.assign({}, super.getAll(), currentScopeState.getAll());
    }
  }
  clone() {
    return new ScopeObject(super.getAll(), this.scopeEditState);
  }
  update(key, value, scope) {
    let state = super.getAll();
    if (!scope) {
      state = super.update(key, value, scope).getAll();
    } else {
      const hasScope = this.hasScopeState(scope);
      if (!hasScope) {
        this.scopeEditState.set(scope, new BaseObject({ [key]: value }));
      } else {
        const currentScopeState = this.getCurrentScopeState(scope);
        this.scopeEditState.set(scope, currentScopeState.update(key, value));
      }
    }
    this.v = state;
  }
}

var PROCESS_GRAPH_TYPE;
(function(PROCESS_GRAPH_TYPE) {
  PROCESS_GRAPH_TYPE['INIT'] = 'INIT';
  PROCESS_GRAPH_TYPE['TASK_CHANGE'] = 'TASK_CHANGE';
})(PROCESS_GRAPH_TYPE || (PROCESS_GRAPH_TYPE = {}));
var ActionType;
(function(ActionType) {
  ActionType['Update'] = 'update';
  ActionType['Remove'] = 'remove';
  ActionType['Merge'] = 'merge';
})(ActionType || (ActionType = {}));
var TargetType;
(function(TargetType) {
  TargetType['TasksMap'] = 'tasksMap';
  TargetType['TaskState'] = 'taskState';
  TargetType['Trigger'] = 'trigger';
  TargetType['CustomAction'] = 'customAction';
  TargetType['TaskStatus'] = 'taskStatus';
  TargetType['CancelMap'] = 'cancelMap';
})(TargetType || (TargetType = {}));
/**
 * 定义静态reducer， 否则可能同时存在多个reducer
 * https://stackoverflow.com/questions/54892403/usereducer-action-dispatched-twice
 *
 * @template T
 * @template U
 * @param {ShareContextClass<IModel, IRelyModel>} state
 * @param {Action<IModel, IRelyModel>} action
 * @returns
 */

function createCommonjsModule(fn, module) {
  return (module = { exports: {} }), fn(module, module.exports), module.exports;
}

var eventemitter3 = createCommonjsModule(function(module) {
  var has = Object.prototype.hasOwnProperty,
    prefix = '~';

  /**
   * Constructor to create a storage for our `EE` objects.
   * An `Events` instance is a plain object whose properties are event names.
   *
   * @constructor
   * @private
   */
  function Events() {}

  //
  // We try to not inherit from `Object.prototype`. In some engines creating an
  // instance in this way is faster than calling `Object.create(null)` directly.
  // If `Object.create(null)` is not supported we prefix the event names with a
  // character to make sure that the built-in object properties are not
  // overridden or used as an attack vector.
  //
  if (Object.create) {
    Events.prototype = Object.create(null);

    //
    // This hack is needed because the `__proto__` property is still inherited in
    // some old browsers like Android 4, iPhone 5.1, Opera 11 and Safari 5.
    //
    if (!new Events().__proto__) prefix = false;
  }

  /**
   * Representation of a single event listener.
   *
   * @param {Function} fn The listener function.
   * @param {*} context The context to invoke the listener with.
   * @param {Boolean} [once=false] Specify if the listener is a one-time listener.
   * @constructor
   * @private
   */
  function EE(fn, context, once) {
    this.fn = fn;
    this.context = context;
    this.once = once || false;
  }

  /**
   * Add a listener for a given event.
   *
   * @param {EventEmitter} emitter Reference to the `EventEmitter` instance.
   * @param {(String|Symbol)} event The event name.
   * @param {Function} fn The listener function.
   * @param {*} context The context to invoke the listener with.
   * @param {Boolean} once Specify if the listener is a one-time listener.
   * @returns {EventEmitter}
   * @private
   */
  function addListener(emitter, event, fn, context, once) {
    if (typeof fn !== 'function') {
      throw new TypeError('The listener must be a function');
    }

    var listener = new EE(fn, context || emitter, once),
      evt = prefix ? prefix + event : event;

    if (!emitter._events[evt])
      (emitter._events[evt] = listener), emitter._eventsCount++;
    else if (!emitter._events[evt].fn) emitter._events[evt].push(listener);
    else emitter._events[evt] = [emitter._events[evt], listener];

    return emitter;
  }

  /**
   * Clear event by name.
   *
   * @param {EventEmitter} emitter Reference to the `EventEmitter` instance.
   * @param {(String|Symbol)} evt The Event name.
   * @private
   */
  function clearEvent(emitter, evt) {
    if (--emitter._eventsCount === 0) emitter._events = new Events();
    else delete emitter._events[evt];
  }

  /**
   * Minimal `EventEmitter` interface that is molded against the Node.js
   * `EventEmitter` interface.
   *
   * @constructor
   * @public
   */
  function EventEmitter() {
    this._events = new Events();
    this._eventsCount = 0;
  }

  /**
   * Return an array listing the events for which the emitter has registered
   * listeners.
   *
   * @returns {Array}
   * @public
   */
  EventEmitter.prototype.eventNames = function eventNames() {
    var names = [],
      events,
      name;

    if (this._eventsCount === 0) return names;

    for (name in (events = this._events)) {
      if (has.call(events, name)) names.push(prefix ? name.slice(1) : name);
    }

    if (Object.getOwnPropertySymbols) {
      return names.concat(Object.getOwnPropertySymbols(events));
    }

    return names;
  };

  /**
   * Return the listeners registered for a given event.
   *
   * @param {(String|Symbol)} event The event name.
   * @returns {Array} The registered listeners.
   * @public
   */
  EventEmitter.prototype.listeners = function listeners(event) {
    var evt = prefix ? prefix + event : event,
      handlers = this._events[evt];

    if (!handlers) return [];
    if (handlers.fn) return [handlers.fn];

    for (var i = 0, l = handlers.length, ee = new Array(l); i < l; i++) {
      ee[i] = handlers[i].fn;
    }

    return ee;
  };

  /**
   * Return the number of listeners listening to a given event.
   *
   * @param {(String|Symbol)} event The event name.
   * @returns {Number} The number of listeners.
   * @public
   */
  EventEmitter.prototype.listenerCount = function listenerCount(event) {
    var evt = prefix ? prefix + event : event,
      listeners = this._events[evt];

    if (!listeners) return 0;
    if (listeners.fn) return 1;
    return listeners.length;
  };

  /**
   * Calls each of the listeners registered for a given event.
   *
   * @param {(String|Symbol)} event The event name.
   * @returns {Boolean} `true` if the event had listeners, else `false`.
   * @public
   */
  EventEmitter.prototype.emit = function emit(event, a1, a2, a3, a4, a5) {
    var evt = prefix ? prefix + event : event;

    if (!this._events[evt]) return false;

    var listeners = this._events[evt],
      len = arguments.length,
      args,
      i;

    if (listeners.fn) {
      if (listeners.once)
        this.removeListener(event, listeners.fn, undefined, true);

      switch (len) {
        case 1:
          return listeners.fn.call(listeners.context), true;
        case 2:
          return listeners.fn.call(listeners.context, a1), true;
        case 3:
          return listeners.fn.call(listeners.context, a1, a2), true;
        case 4:
          return listeners.fn.call(listeners.context, a1, a2, a3), true;
        case 5:
          return listeners.fn.call(listeners.context, a1, a2, a3, a4), true;
        case 6:
          return listeners.fn.call(listeners.context, a1, a2, a3, a4, a5), true;
      }

      for (i = 1, args = new Array(len - 1); i < len; i++) {
        args[i - 1] = arguments[i];
      }

      listeners.fn.apply(listeners.context, args);
    } else {
      var length = listeners.length,
        j;

      for (i = 0; i < length; i++) {
        if (listeners[i].once)
          this.removeListener(event, listeners[i].fn, undefined, true);

        switch (len) {
          case 1:
            listeners[i].fn.call(listeners[i].context);
            break;
          case 2:
            listeners[i].fn.call(listeners[i].context, a1);
            break;
          case 3:
            listeners[i].fn.call(listeners[i].context, a1, a2);
            break;
          case 4:
            listeners[i].fn.call(listeners[i].context, a1, a2, a3);
            break;
          default:
            if (!args)
              for (j = 1, args = new Array(len - 1); j < len; j++) {
                args[j - 1] = arguments[j];
              }

            listeners[i].fn.apply(listeners[i].context, args);
        }
      }
    }

    return true;
  };

  /**
   * Add a listener for a given event.
   *
   * @param {(String|Symbol)} event The event name.
   * @param {Function} fn The listener function.
   * @param {*} [context=this] The context to invoke the listener with.
   * @returns {EventEmitter} `this`.
   * @public
   */
  EventEmitter.prototype.on = function on(event, fn, context) {
    return addListener(this, event, fn, context, false);
  };

  /**
   * Add a one-time listener for a given event.
   *
   * @param {(String|Symbol)} event The event name.
   * @param {Function} fn The listener function.
   * @param {*} [context=this] The context to invoke the listener with.
   * @returns {EventEmitter} `this`.
   * @public
   */
  EventEmitter.prototype.once = function once(event, fn, context) {
    return addListener(this, event, fn, context, true);
  };

  /**
   * Remove the listeners of a given event.
   *
   * @param {(String|Symbol)} event The event name.
   * @param {Function} fn Only remove the listeners that match this function.
   * @param {*} context Only remove the listeners that have this context.
   * @param {Boolean} once Only remove one-time listeners.
   * @returns {EventEmitter} `this`.
   * @public
   */
  EventEmitter.prototype.removeListener = function removeListener(
    event,
    fn,
    context,
    once
  ) {
    var evt = prefix ? prefix + event : event;

    if (!this._events[evt]) return this;
    if (!fn) {
      clearEvent(this, evt);
      return this;
    }

    var listeners = this._events[evt];

    if (listeners.fn) {
      if (
        listeners.fn === fn &&
        (!once || listeners.once) &&
        (!context || listeners.context === context)
      ) {
        clearEvent(this, evt);
      }
    } else {
      for (var i = 0, events = [], length = listeners.length; i < length; i++) {
        if (
          listeners[i].fn !== fn ||
          (once && !listeners[i].once) ||
          (context && listeners[i].context !== context)
        ) {
          events.push(listeners[i]);
        }
      }

      //
      // Reset the array, or remove it completely if we have no more listeners.
      //
      if (events.length)
        this._events[evt] = events.length === 1 ? events[0] : events;
      else clearEvent(this, evt);
    }

    return this;
  };

  /**
   * Remove all listeners, or those of the specified event.
   *
   * @param {(String|Symbol)} [event] The event name.
   * @returns {EventEmitter} `this`.
   * @public
   */
  EventEmitter.prototype.removeAllListeners = function removeAllListeners(
    event
  ) {
    var evt;

    if (event) {
      evt = prefix ? prefix + event : event;
      if (this._events[evt]) clearEvent(this, evt);
    } else {
      this._events = new Events();
      this._eventsCount = 0;
    }

    return this;
  };

  //
  // Alias methods names because people roll like that.
  //
  EventEmitter.prototype.off = EventEmitter.prototype.removeListener;
  EventEmitter.prototype.addListener = EventEmitter.prototype.on;

  //
  // Expose the prefix.
  //
  EventEmitter.prefixed = prefix;

  //
  // Allow `EventEmitter` to be imported as module namespace.
  //
  EventEmitter.EventEmitter = EventEmitter;

  //
  // Expose the module.
  //
  {
    module.exports = EventEmitter;
  }
});

//

var shallowequal = function shallowEqual(objA, objB, compare, compareContext) {
  var ret = compare ? compare.call(compareContext, objA, objB) : void 0;

  if (ret !== void 0) {
    return !!ret;
  }

  if (objA === objB) {
    return true;
  }

  if (typeof objA !== 'object' || !objA || typeof objB !== 'object' || !objB) {
    return false;
  }

  var keysA = Object.keys(objA);
  var keysB = Object.keys(objB);

  if (keysA.length !== keysB.length) {
    return false;
  }

  var bHasOwnProperty = Object.prototype.hasOwnProperty.bind(objB);

  // Test for A's keys different from B.
  for (var idx = 0; idx < keysA.length; idx++) {
    var key = keysA[idx];

    if (!bHasOwnProperty(key)) {
      return false;
    }

    var valueA = objA[key];
    var valueB = objB[key];

    ret = compare ? compare.call(compareContext, valueA, valueB, key) : void 0;

    if (ret === false || (ret === void 0 && valueA !== valueB)) {
      return false;
    }
  }

  return true;
};

function checkIsChange(context, oldContext, taskKey) {
  const scope = context.tasksMap.get(taskKey).scope;
  const preScope =
    oldContext.tasksMap.get(taskKey) && oldContext.tasksMap.get(taskKey).scope;
  return (
    context.taskStatus.get(taskKey) !== oldContext.taskStatus.get(taskKey) ||
    context.taskState.get(taskKey, scope) !==
      oldContext.taskState.get(taskKey, preScope)
  );
}
var CompareType;
(function(CompareType) {
  CompareType['ExecuteTask'] = 'ExecuteTask';
  CompareType['ViewShouldUpdate'] = 'ViewShouldUpdate';
})(CompareType || (CompareType = {}));
function checkTaskChange(preProps, nextProps, type) {
  if (!nextProps || !preProps) {
    return true;
  }
  let change = false;
  const notCareKeys = ['defaultValue', 'moduleConfig', 'areEqualForTask'];
  Object.keys(preProps).forEach((key) => {
    if (key === 'deps') {
      change = nextProps[key].some((item, index) => {
        return !shallowequal(item, preProps[key][index]);
      });
    } else if (notCareKeys.includes(key)) {
      if (checkIsModuleChange(preProps, nextProps, type)) {
        change = true;
      }
    } else {
      if (!shallowequal(preProps[key], nextProps[key])) {
        change = true;
      }
    }
  });
  return change;
}
function checkIsModuleChange(preProps, nextProps, type) {
  const { areEqualForTask, moduleConfig } = nextProps;
  const preModuleConfig = preProps && preProps.moduleConfig;
  const isModelConfigChange = areEqualForTask
    ? !areEqualForTask(type, moduleConfig, preModuleConfig)
    : !shallowequal(moduleConfig, preModuleConfig);
  // console.log('isModelConfigChange: ', isModelConfigChange);
  return isModelConfigChange;
}
function createBaseContext(id, context, defaultTaskMap) {
  let taskInfo = context.tasksMap.get(id);
  taskInfo = taskInfo ? taskInfo : defaultTaskMap;
  const { moduleConfig, deps = [], scope } = taskInfo;
  return {
    id,
    deps: deps,
    moduleConfig,
    depsModuleConfig: deps.map((dep) => {
      const taskMap = context.tasksMap;
      return taskMap.get(dep.id) && taskMap.get(dep.id).moduleConfig;
    }),
    depsValues: (deps || (taskInfo && taskInfo.deps) || []).map((key) => {
      const currentDeptId = key.id;
      const scope =
        context.tasksMap.get(currentDeptId) &&
        context.tasksMap.get(currentDeptId).scope;
      return context.taskState.get(currentDeptId, scope);
    }),
    state: context.taskState.getAll(),
    value: context.taskState.get(id, scope),
    lastDepsValue: deps.map((dep) => {
      const tasksMap = context.tasksMap;
      if (tasksMap.get(dep.id)) {
        const scope = tasksMap.get(dep.id).scope;
        return context.preTaskState && context.preTaskState.get(dep.id, scope);
      } else {
        return null;
      }
    }),
  };
}

class ShareContextClass {
  constructor(config) {
    this.queue = new Set();
    this.uiQueue = new Set();
    this.triggerQueue = new Set();
    // 记录被修改了的字段
    this.dirtySets = new Set();
    this.onPropsChange = () => {};
    this.onPropsStateChange = () => {};
    /**
     * 单个任务执行后的hook
     *
     * @memberof BaseFieldContext
     */
    this.onChange = (callbackInfo) => {
      const { currentKey: key } = callbackInfo;
      if (callbackInfo.isEnd) {
        const all = this.taskState.getAll();
        this.cancelMap.removeAll();
        if (all) {
          this.onPropsChange(all, this.taskState);
        }
        // 状态更新后清空
        this.dirtySets.clear();
      }
      this.udpateState(key, ActionType.Update, TargetType.TaskStatus, {
        value: NodeStatus.IDeal,
      });
      if (key) {
        this.preTaskState = this.taskState.clone();
        const { deps = [] } = this.getTaskMap(key);
        // 如果没有处理函数，则不更新模块
        if (
          this.dirtySets.has(key) ||
          deps.some((dep) => this.dirtySets.has(dep.id))
        ) {
          // 组件有任务执行的时候需要刷新
          this.notifyModule(key);
        } else {
          if (process.env.NODE_ENV === 'production') {
            console.warn(
              `id为${key}的模块，在触发时未通过updateState执行任何数据变更`
            );
          }
        }
      }
      // 去掉cancel依赖
      if (key) {
        this.cancelMap.remove(key);
      }
    };
    this.refresh = (key, value) => {
      const { scope } = this.getTaskMap(key);
      if (value) {
        this.udpateState(key, ActionType.Update, TargetType.TaskState, value);
        this.notifyModule(key, true);
      }
      this.executeTask({ key, scope, downStreamOnly: false });
    };
    window.store = this;
    this.eventEmitter = new eventemitter3();
    this.name = config.name;
    this.subject = new eventemitter3();
    this.taskScheduler = new CommonQueue(
      [],
      this.preChange.bind(this),
      this.onChange,
      this.onError.bind(this),
      (type, content) => {
        this.subject.emit(type, content);
        // 构成新运行图的时候，设置状态
        if (type === TaskEventType.ProcessRunningGraph) {
          const {
            currentRunningPoints,
            triggerPoints,
            conflictPoints,
          } = content;
          // 通知冲突的点
          conflictPoints.forEach((id) => {
            if (this.isRecordStatus(id)) {
              this.udpateState(id, ActionType.Update, TargetType.TaskStatus, {
                value: NodeStatus.IDeal,
                errorMsg: undefined,
              });
              this.notifyModule(id);
            }
          });
          currentRunningPoints.forEach((item) => {
            const { key: id } = item;
            if (this.isRecordStatus(id)) {
              const status = this.getTaskStatus(id);
              this.udpateState(id, ActionType.Update, TargetType.TaskStatus, {
                value: NodeStatus.Waiting,
                errorMsg: undefined,
              });
              if (!status || status.value !== NodeStatus.Waiting) {
                this.notifyModule(id);
              }
            }
          });
        }
      }
    );
    this.tasksMap = config.tasksMap;
    this.taskState = config.taskState;
    this.taskStatus = config.taskStatus;
    this.cancelMap = config.cancelMap;
  }
  initSchedule() {
    this.taskScheduler.updateTasks(this.getTask());
    const firstPoints = this.taskScheduler.getFirstAllPoints();
    // 初始化事件
    this.subject.emit(TaskEventType.Init);
    if (firstPoints.length > 0) {
      this.executeTask(
        firstPoints.map((item) => ({ key: item, downStreamOnly: false }))
      );
    }
  }
  mergeScopeState2Global(id) {
    const { scope } = this.tasksMap.get(id);
    const scopeKeys = Array.from(this.tasksMap.getAll().keys()).filter(
      (key) => {
        return this.tasksMap.get(key).scope === scope;
      }
    );
    // .filter((key) => {
    //   return this.taskState.get(key, scope) !== this.taskState.get(key);
    // });
    this.mergeStateByScope(scope);
    ReactDOM.unstable_batchedUpdates(() => {
      scopeKeys.forEach((scopeKey) => {
        this.triggerSchedule(scopeKey, {
          refresh: false,
          force: true,
        });
      });
    });
  }
  triggerQueueAdd(point) {
    this.triggerQueue.add(point);
  }
  triggerSchedule(id, options = {}) {
    const { refresh = false, force } = options;
    const { scope } = this.getTaskMap(id);
    const point = { key: id, downStreamOnly: !refresh };
    if (!force) {
      point.scope = scope;
    }
    const p = this.taskScheduler.getAllPointFired(point);
    if (p.length === 0) {
      this.onPropsChange(this.taskState.getAll(), this.taskState);
    } else {
      this.triggerQueueAdd(point);
      this.batchTriggerChange();
    }
  }
  batchTriggerSchedule(points) {
    this.subject.emit(TaskEventType.BatchEventTrigger);
    this.executeTask(points);
  }
  taskUpdateSchedule(id) {
    this.subject.emit(TaskEventType.TaskChange);
    const { scope } = this.getTaskMap(id);
    this.executeTask({ key: id, scope, downStreamOnly: false });
  }
  isRecordStatus(key) {
    const task = this.tasksMap.get(key);
    if (!task) {
      return false;
    }
    const { recordStatus = true } = task;
    if (typeof recordStatus === 'function') {
      return recordStatus(this.getTaskInfo(key, task));
    } else {
      return recordStatus;
    }
  }
  /**
   *
   * 单个任务执行前的hook
   * @memberof BaseFieldContext
   */
  preChange(key) {
    // LOADING 的多种模式，1.仅在当前任务触发前开启 2. 批量任务开始时，全部置为为loading状态
    if (key) {
      if (this.isRecordStatus(key)) {
        this.udpateState(key, ActionType.Update, TargetType.TaskStatus, {
          value: NodeStatus.Running,
          errorMsg: undefined,
        });
        this.notifyModule(key);
      }
    }
  }
  /**
   * 任务流执行失败的回调
   *
   * @memberof BaseFieldContext
   */
  onError(currentKey, notFinishPoint, errorMsg, callbackInfo) {
    let keys = [currentKey];
    keys = keys.concat(notFinishPoint);
    keys.forEach((k) => {
      if (this.isRecordStatus(k)) {
        this.udpateState(k, ActionType.Update, TargetType.TaskStatus, {
          value: NodeStatus.Error,
          errorMsg: errorMsg,
        });
      }
      this.notifyModule(k);
    });
  }
  notifyModule(id, now = false) {
    if (now) {
      this.eventEmitter.emit(id + '----' + StateUpdateType.State);
    } else {
      this.uiQueue.add(id);
      this.batchUiChange();
    }
  }
  getTask() {
    const tasks = [...this.tasksMap.getAll().values()];
    const newTasks = tasks.map((task) => {
      // 判断是否是初始化应该在事件初始化的时候，如果放在回调中，那么判断就滞后了，用了回调时的taskMap判断了
      return {
        key: task.id,
        deps: task.deps,
        taskType: task.reactionType,
        scope: task.scope,
        task: (taskInfo) => {
          const { key } = taskInfo;
          let defaultTask;
          // 默认任务执行方式
          if (task.reactionType === ReactionType.Sync) {
            defaultTask = (currentTaskInfo) => {
              currentTaskInfo.updateState(currentTaskInfo.value);
            };
          } else {
            defaultTask = (currentTaskInfo) => {
              return new Promise((resolve) => {
                resolve();
              });
            };
          }
          if (!!task.reaction) {
            defaultTask = task.reaction;
          }
          return defaultTask(this.getTaskInfo(key, taskInfo));
        },
      };
    });
    return newTasks;
  }
  getTaskInfo(key, taskInfo) {
    let reactionContext = Object.assign(
      Object.assign({}, createBaseContext(key, this)),
      {
        updateState: (value) => {
          this.udpateState(key, ActionType.Update, TargetType.TaskState, value);
        },
        callbackMapWhenConflict: (callback) => {
          const cancel = this.cancelMap.get(key);
          if (cancel) {
            cancel();
            this.cancelMap.remove(key);
          }
          this.udpateState(
            key,
            ActionType.Update,
            TargetType.CancelMap,
            callback
          );
        },
      }
    );
    return reactionContext;
  }
  getTaskMap(id) {
    return this.tasksMap.get(id);
  }
  getTaskState(id, scope) {
    return this.taskState.get(id, scope);
  }
  getTaskStatus(id) {
    return this.taskStatus.get(id);
  }
  getReducer(id) {
    const reducer = this.tasksMap.get(id).reducer;
    return reducer;
  }
  next(id, value, options) {
    this.udpateState(id, ActionType.Update, TargetType.TaskState, value);
    this.notifyModule(id, true);
    this.triggerSchedule(id, options);
  }
  dispatchAction(id, customAction, options = {}) {
    const { executeTask = true } = options;
    const { reducer, scope } = this.getTaskMap(id);
    if (reducer) {
      this.udpateState(
        id,
        ActionType.Update,
        TargetType.TaskState,
        reducer(this.getTaskState(id, scope), customAction, this)
      );
      this.notifyModule(id, true);
    }
    if (executeTask) {
      this.triggerSchedule(id, options);
    }
  }
  mergeStateByScope(scope) {
    this.taskState.merge(scope);
    this.taskState = this.taskState.clone();
  }
  addOrUpdateTask(
    id,
    taskInfo,
    options = { notifyTask: true, notifyView: false }
  ) {
    const { notifyView, notifyTask } = options;
    this.udpateState(id, ActionType.Update, TargetType.TasksMap, taskInfo);
    if (notifyView) {
      this.notifyModule(id);
    }
    if (notifyTask) {
      this.triggerSchedule(id, { refresh: true });
    }
  }
  removeTask(id) {
    this.udpateState(id, ActionType.Remove, TargetType.TasksMap);
  }
  udpateState(key, type, targetType, paylaod) {
    this.subject.emit(TaskEventType.StateChange, {
      actionType: type,
      targetType,
      value: paylaod,
      key: key,
    });
    if (targetType === TargetType.TaskState) {
      // 标记dirty
      this.onPropsStateChange(key, paylaod, type);
      this.dirtySets.add(key);
    }
    const scope = this.tasksMap.get(key) && this.tasksMap.get(key).scope;
    if (type === ActionType.Remove) {
      this[targetType][type](key, scope);
    } else if (type === ActionType.Update) {
      this[targetType][type](key, paylaod, scope);
    } else if (type === ActionType.Merge) {
      this[targetType][type](scope);
    }
    this[targetType] = this[targetType].clone();
  }
  batchUpdateState(tasks) {
    tasks.forEach((item) => {
      const { key, type, targetType, payload } = item;
      this.udpateState(key, type, targetType, payload);
    });
  }
  executeTask(taskKeys) {
    this.taskScheduler.updateTasks(this.getTask());
    this.taskScheduler.getAllPointFired(taskKeys).forEach((point) => {
      const cancel = this.cancelMap.get(point);
      if (cancel) {
        cancel();
        this.cancelMap.remove(point);
      }
    });
    this.taskScheduler.notifyDownstream(taskKeys);
  }
}
const initValue = () => ({
  tasksMap: new BaseMap(new Map()),
  taskState: new ScopeObject({}),
  taskStatus: new BaseObject({}),
  cancelMap: new BaseMap(new Map()),
  parentMounted: false,
});
const ShareContextInstance = React__default.createContext(initValue());
const ShareContextProvider = ShareContextInstance.Provider;
const ShareContextConsumer = ShareContextInstance.Consumer;

const Batcher = (props) => {
  const [state, dispatch] = React__default.useReducer((s) => ({}), {});
  const storeRef = useContext(ShareContextInstance);
  props.setNotifyBatcherOfChange(() => dispatch());
  useEffect(() => {
    if (storeRef.uiQueue.size > 0) {
      Array.from(storeRef.uiQueue).forEach((id) => {
        storeRef.eventEmitter.emit(id + '----' + StateUpdateType.State);
      });
      storeRef.uiQueue.clear();
    }
  });
  return null;
};

const ScheduleBatcher = (props) => {
  const storeRef = useContext(ShareContextInstance);
  const [_, setState] = useState([]);
  props.setNotifyBatcherOfChange(() => setState({}));
  useEffect(() => {
    if (storeRef.triggerQueue.size > 0) {
      storeRef.batchTriggerSchedule(Array.from(storeRef.triggerQueue));
    }
    storeRef.triggerQueue.clear();
  });
  return null;
};

const Rdx = (props) => {
  const {
    initializeState,
    onChange = () => {},
    onStateChange = () => {},
    shouldUpdate,
    state,
    name,
    withRef,
    createStore,
  } = props;
  const isUnderControl = state !== undefined;
  const currentState = state || initializeState || {};
  function createTaskState(value) {
    return createStore
      ? createStore(currentState)
      : new ScopeObject(currentState);
  }
  const store = useRef(
    new ShareContextClass(
      Object.assign(Object.assign({}, initValue()), {
        name,
        taskState: createTaskState(),
      })
    )
  );
  store.current.onPropsChange = onChange;
  store.current.onPropsStateChange = onStateChange;
  const uiNotifyBatcherOfChange = useRef(null);
  const setUiNotifyBatcherOfChange = (x) => {
    uiNotifyBatcherOfChange.current = x;
  };
  const scheduleNotifyBatcherOfChange = useRef(null);
  const setScheduleNotifyBatcherOfChange = (x) => {
    scheduleNotifyBatcherOfChange.current = x;
  };
  store.current.batchUiChange = () => {
    uiNotifyBatcherOfChange.current();
  };
  store.current.batchTriggerChange = () => {
    scheduleNotifyBatcherOfChange.current();
  };
  withRef && (withRef.current = store.current);
  store.current.subject.emit(TaskEventType.RdxContextInit);
  useEffect(() => {
    if (isUnderControl) {
      const diffObjectKeys = Array.from(
        store.current.tasksMap.getAll().keys()
      ).filter((key) => {
        return shouldUpdate
          ? shouldUpdate(store.current.taskState.get(key), state[key])
          : state[key] !== store.current.taskState.get(key);
      });
      store.current.taskState = createTaskState();
      ReactDOM.unstable_batchedUpdates(() => {
        diffObjectKeys.forEach((key) => {
          store.current.notifyModule(key);
        });
      });
    }
  }, [state]);
  useEffect(() => {
    const queue = store.current.queue;
    store.current.parentMounted = true;
    if (queue.size > 0) {
      store.current.batchTriggerSchedule(
        Array.from(queue)
          .reverse()
          .map((item) => ({ key: item, downStreamOnly: false }))
      );
      queue.clear();
    }
  }, []);
  return createElement(
    ShareContextProvider,
    { value: store.current },
    createElement(Batcher, {
      setNotifyBatcherOfChange: setUiNotifyBatcherOfChange,
    }),
    createElement(ScheduleBatcher, {
      setNotifyBatcherOfChange: setScheduleNotifyBatcherOfChange,
    }),
    props.children
  );
};
const RdxContext = Rdx;

function getTaskInfo(props) {
  const rest = __rest(props, ['context']);
  return rest;
}
function useTaskInit(props) {
  const { context, id } = props;
  const taskInfo = getTaskInfo(props);
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
function useMount() {
  const mount = useRef(false);
  useEffect(() => {
    mount.current = true;
  }, []);
  return mount;
}
function useTaskUpdate(nextProps) {
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
      const taskInfo = getTaskInfo(nextProps);
      if (!context.tasksMap.get(id)) {
        context.removeTask(id);
        context.addOrUpdateTask(id, taskInfo, {
          notifyTask: true,
          notifyView: false,
        });
      } else {
        const preTaskInfo = context.tasksMap.get(id);
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
function useStateUpdate(id, context, type) {
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

var RdxView = (props) => {
  return React__default.createElement(ShareContextConsumer, null, (context) => {
    return React__default.createElement(
      Module,
      Object.assign({}, props, { context: context })
    );
  });
};
function Module(props) {
  const { id, scope, defaultValue } = props;
  // 设置默认值
  const mount = useMount();
  if (
    !mount.current &&
    defaultValue !== undefined &&
    props.context.getTaskState(id, scope) === undefined
  ) {
    props.context.udpateState(
      id,
      ActionType.Update,
      TargetType.TaskState,
      defaultValue
    );
  }
  useTaskInit(props);
  useTaskUpdate(props);
  return React__default.createElement(
    MomeAtomComponent,
    Object.assign({}, props)
  );
}
const isLoading = (props) => {
  var _a;
  return (
    ((_a = props.context.taskStatus.get(props.id)) === null || _a === void 0
      ? void 0
      : _a.value) === NodeStatus.Waiting
  );
};
/**
 *
 * @param props 原子组件，除非id改变，否则只能接受内部控制渲染
 */
function AtomComponent(props) {
  const { id, context } = props;
  const taskInfo = context.tasksMap.get(id);
  const { render, moduleConfig, deps, component, scope } = taskInfo
    ? taskInfo
    : props;
  // 移入context中，这里只是发个消息，否则用来执行的不一定是最终状态
  useStateUpdate(id, context, StateUpdateType.State);
  useStateUpdate(id, context, StateUpdateType.ReactionStatus);
  const data = Object.assign(
    Object.assign({}, createBaseContext(id, context, props)),
    {
      next: (selfValue, options) => {
        context.next(id, selfValue, options);
      },
      dispatchById: (id, action, options) => {
        context.dispatchAction(id, action, options);
      },
      dispatch: (action, options) => {
        context.dispatchAction(id, action, options);
      },
      refreshView: () => {
        context.notifyModule(id);
      },
      nextById: (id, selfValue, options) => {
        context.next(id, selfValue, options);
      },
      loading: isLoading(props),
      // TODO: 其他组件中的默认值， 怎么获取
      mergeScopeState2Global: () => {
        context.mergeScopeState2Global(id);
      },
      value: context.taskState.get(id, scope),
      status:
        context.taskStatus.get(id) && context.taskStatus.get(id).value
          ? context.taskStatus.get(id).value
          : RENDER_STATUS.FirstRender,
      errorMsg: (context.taskStatus.get(id) || {}).errorMsg,
      // ? 这里应该加上scope， 刷新只刷新作用域下面的
      refresh: context.refresh.bind(null, id),
    }
  );
  const Component = component;
  if (component) {
    return React__default.createElement(Component, Object.assign({}, data));
  }
  return React__default.createElement(
    React__default.Fragment,
    null,
    render ? render(data) : null
  );
}
class MomeAtomComponent extends React__default.Component {
  shouldComponentUpdate(nextProps) {
    return this.props.id !== nextProps.id;
  }
  render() {
    const _a = this.props,
      { context } = _a,
      rest = __rest(_a, ['context']);
    return React__default.createElement(
      AtomComponent,
      Object.assign({ context: context }, rest)
    );
  }
}
const useForceUpdate = () => {
  const [state, setState] = useState(1);
  return () => {
    setState((state) => state + 1);
  };
};

let reactionId = 0;
function useRdxReaction(props) {
  const uniqueId = useRef('reaction-' + reactionId++);
  const context = useContext(ShareContextInstance);
  const { deps: deps, reaction, recordStatus, reactionType } = props;
  useEffect(() => {
    context.addOrUpdateTask(
      uniqueId.current,
      {
        id: uniqueId.current,
        deps: deps,
        reaction,
        recordStatus,
        reactionType,
      },
      { notifyTask: false, notifyView: true }
    );
  });
  // useStateUpdate(uniqueId.current, context, StateUpdateType.ReactionStatus);
  return [context.taskStatus.get(uniqueId.current)];
}
function useRdxState(props) {
  const context = useContext(ShareContextInstance);
  const { id, defaultValue, reducer } = props;
  useTaskInit({
    context,
    id,
    defaultValue,
    reducer,
  });
  useTaskUpdate({
    context,
    id,
    defaultValue,
    reducer,
  });
  useStateUpdate(id, context, StateUpdateType.State);
  return [
    context.taskState.get(id),
    (state) => {
      let newState = state;
      if (typeof state == 'function') {
        newState = state(context.getTaskState(id, undefined));
      }
      context.next(id, newState);
    },
    (action) => {
      context.dispatchAction(id, action);
    },
  ];
}

const batchUpdate = (callback) => {
  ReactDOM.unstable_batchedUpdates(callback);
};

function globalSelf() {
  try {
    if (typeof self !== 'undefined') {
      return self;
    }
  } catch (e) {}
  try {
    if (typeof window !== 'undefined') {
      return window;
    }
  } catch (e) {}
  try {
    if (typeof global !== 'undefined') {
      return global;
    }
  } catch (e) {}
  return Function('return this')();
}
const globalThisPolyfill = globalSelf();
const env = {
  portalDOM: null,
};
const render = (element) => {
  if (globalThisPolyfill['document']) {
    env.portalDOM =
      env.portalDOM || globalThisPolyfill['document'].createElement('div');
    return require('react-dom').createPortal(element, env.portalDOM);
  } else {
    return React__default.createElement('template', null, element);
  }
};

const has = Object.prototype.hasOwnProperty;
const toString = Object.prototype.toString;
function isEmpty(val) {
  // Null and Undefined...
  if (val == null) {
    return true;
  }
  // Booleans...
  if (typeof val === 'boolean') {
    return false;
  }
  // Numbers...
  if (typeof val === 'number') {
    return false;
  }
  // Strings...
  if (typeof val === 'string') {
    return val.length === 0;
  }
  // Functions...
  if (typeof val === 'function') {
    return val.length === 0;
  }
  // Arrays...
  if (Array.isArray(val)) {
    if (val.length === 0) {
      return true;
    }
    for (let i = 0; i < val.length; i++) {
      if (
        val[i] !== undefined &&
        val[i] !== null &&
        val[i] !== '' &&
        val[i] !== 0
      ) {
        return false;
      }
    }
    return true;
  }
  // Errors...
  if (val instanceof Error) {
    return val.message === '';
  }
  // Objects...
  if (val.toString === toString) {
    switch (val.toString()) {
      // Maps, Sets, Files and Errors...
      case '[object File]':
      case '[object Map]':
      case '[object Set]': {
        return val.size === 0;
      }
      // Plain objects...
      case '[object Object]': {
        for (const key in val) {
          if (has.call(val, key)) {
            return false;
          }
        }
        return true;
      }
    }
  }
  // Anything else...
  return false;
}

function getVaildErrors(errors = []) {
  return errors.filter((error) => !isEmpty(error));
}
function isError(errors) {
  return getVaildErrors(errors).length > 0;
}

class ErrorContextClass {
  constructor() {
    this.errors = {};
  }
  setErrors(key, errors) {
    this.errors[key] = errors;
  }
  getErrors(key) {
    return this.errors[key];
  }
}
const ErrorContextInstance = createContext(new ErrorContextClass());

var DepsType;
(function(DepsType) {
  DepsType['Relative'] = 'Relative';
  DepsType['Absolute'] = 'Absolute';
})(DepsType || (DepsType = {}));
function isFunc(a) {
  return typeof a === 'function';
}
function getDefaultValue(defaultValue, disabled = false, dataSource) {
  return {
    value: isFunc(defaultValue) ? defaultValue() : defaultValue,
    disabled: disabled,
    dataSource,
  };
}
const RdxFormItem = (props) => {
  const {
      name,
      reaction = (context) => {},
      deps = [],
      dataSource,
      children,
      type,
      compute,
      defaultVisible,
      firstRender = true,
      disabled,
      default: defaultV,
    } = props,
    rest = __rest(props, [
      'name',
      'reaction',
      'deps',
      'dataSource',
      'children',
      'type',
      'compute',
      'defaultVisible',
      'firstRender',
      'disabled',
      'default',
    ]);
  const { paths } = useContext(PathContextInstance);
  const atomReaction = reaction && useCallback(reaction, []);
  const errorStore = useContext(ErrorContextInstance);
  const id = [...paths, name].join('.');
  const atomRender = useCallback((context) => {
    const {
      id,
      status,
      errorMsg,
      refreshView,
      value,
      next,
      moduleConfig,
    } = context;
    if (status === Status.FirstRender && !firstRender) {
      return React__default.createElement(React__default.Fragment, null);
    }
    const { xProps } = value,
      rest = __rest(value, ['xProps']);
    const { xProps: xModuleProps, rules = [], require } = moduleConfig,
      restMoudleConfig = __rest(moduleConfig, ['xProps', 'rules', 'require']);
    function validator(value, context) {
      return __awaiter(this, void 0, void 0, function*() {
        let infos = [];
        for (let rule of rules) {
          infos.push(yield rule(value, context));
        }
        return infos;
      });
    }
    const newProps = Object.assign(
      Object.assign(
        Object.assign(
          Object.assign(Object.assign({}, restMoudleConfig), rest),
          xModuleProps
        ),
        xProps
      ),
      {
        onChange: (v) => {
          const newValue = Object.assign(Object.assign({}, value), {
            value: v,
          });
          compute ? compute(v, context) : next(newValue);
          validator(v, context)
            .then((errors) => {
              errorStore.setErrors(id, errors);
              refreshView();
            })
            .catch((error) => {
              console.error('规则执行错误', error.toString());
            });
        },
      }
    );
    return React__default.createElement(
      FromItem,
      {
        rules: rules,
        xProps: newProps,
        status: status,
        require: require,
        formErrorMsg: errorStore.getErrors(id),
        errorMsg: errorMsg,
      },
      children
    );
  }, []);
  return React__default.createElement(RdxView, {
    id: id,
    reactionType: isPromise(reaction) ? ReactionType.Async : ReactionType.Sync,
    defaultValue: getDefaultValue(defaultV, disabled, dataSource),
    moduleConfig: Object.assign(
      Object.assign({ name, type, dataSource }, rest),
      { visible: defaultVisible === undefined ? true : false }
    ),
    areEqualForTask: (type, preConfig, nextConfig) => {
      if (type === CompareType.ExecuteTask) {
        return true;
      } else {
        return Object.keys(nextConfig).every((key) => {
          return shallowequal(preConfig[key], nextConfig[key]);
        });
      }
    },
    reaction: atomReaction,
    deps: deps.map((item) => ({
      id:
        item.type === DepsType.Absolute
          ? item.id
          : [...paths, item.id].join('.'),
    })),
    render: atomRender,
  });
};
function getDisplayType(props) {
  const { layoutType } = props;
  let style = {};
  if (!layoutType) {
    style.display = 'block';
  } else if (layoutType === LayoutType.Grid) {
    style.display = 'block';
  } else {
    style.display = 'inline-block';
  }
  return style;
}
const FormStyleItemLabel = styled.div`
  line-height: 28px;
  vertical-align: top;
  color: #666666;
  display: inline-block;
  text-align: right;
  padding-right: 12px;
  line-height: 28px;
  ::before {
    display: ${(props) => (props.require ? 'visible' : 'none')};
    content: '*';
    color: #ff3000;
    margin-right: 4px;
  }
`;
const FormStyleItemContent = styled.div`
  line-height: 28px;
  /* flex:  */
`;
const FormItemWrapper = styled.div`
  margin-bottom: 16px;
`;
const FromItem = (props) => {
  const {
    children,
    formErrorMsg,
    status,
    errorMsg,
    require,
    xProps = {},
  } = props;
  const {
      title,
      dataSource,
      disabled,
      visible,
      name,
      type,
      xComponent,
      desc,
      rules,
    } = xProps,
    rest = __rest(xProps, [
      'title',
      'dataSource',
      'disabled',
      'visible',
      'name',
      'type',
      'xComponent',
      'desc',
      'rules',
    ]);
  const Cmp = getRegistry().fields[xComponent || type];
  const transformProps = Object.assign(
    Object.assign(
      {
        name,
        status,
        loading: status === Status.Waiting || status === Status.Running,
        error: status === Status.Error,
      },
      rest
    ),
    { children }
  );
  if (dataSource) {
    transformProps.dataSource = dataSource;
  }
  if (disabled) {
    transformProps.disabled = disabled;
  }
  const layoutContext = useContext(LayoutContextInstance);
  const { labelCol, wrapCol, layoutType, labelTextAlign } = layoutContext;
  const isGrid = layoutType === LayoutType.Grid;
  const gridStyle = {
    display: 'flex',
  };
  const wrapInlineStyle = {
    display: 'inline',
  };
  return React__default.createElement(
    React__default.Fragment,
    null,
    visible &&
      React__default.createElement(
        FormItemWrapper,
        {
          isGrid: isGrid,
          style: layoutType
            ? isGrid
              ? gridStyle
              : wrapInlineStyle
            : undefined,
          className: 'rdx-form-item',
        },
        title &&
          React__default.createElement(
            FormStyleItemLabel,
            {
              style: {
                flex: `0 0 ${getWidth(labelCol)}`,
                textAlign: labelTextAlign,
              },
              require: require,
              layoutType: layoutType,
              className: 'rdx-form-item-label',
            },
            title
          ),
        React__default.createElement(
          FormStyleItemContent,
          {
            style: Object.assign(
              Object.assign({}, getDisplayType(layoutContext)),
              { flex: `0 0 ${getWidth(wrapCol)}` }
            ),
            layoutType: layoutType,
            className: 'rdx-form-item-content',
          },
          Cmp &&
            React__default.createElement(
              Cmp,
              Object.assign({}, transformProps)
            ),
          React__default.createElement(
            'div',
            { style: { color: '#999999' } },
            desc
          ),
          React__default.createElement(
            'div',
            { style: { color: 'red' } },
            isError(formErrorMsg) && formErrorMsg
          )
        )
      )
  );
};
function getWidth(col) {
  const colspan = (col / 24) * 100;
  return `${colspan}%`;
}

class FormStore {
  constructor(v) {
    // 实际数据
    this.state = {};
    // 运行时逻辑
    this.runningState = {};
    this.state = v.state;
    this.runningState = v.runningState;
  }
  clone() {
    return new FormStore({
      state: this.state,
      runningState: this.runningState,
    });
  }
  merge(scope) {
    throw new Error('Method not implemented.');
  }
  remove(key, scope) {
    set(this.state, key, undefined);
    delete this.runningState[key];
  }
  update(key, value, scope) {
    const { value: currentV } = value,
      rest = __rest(value, ['value']);
    set(this.state, key, currentV);
    this.runningState[key] = rest;
  }
  get(key, scope) {
    const value = get(this.state, key);
    const others = this.runningState[key];
    return value === undefined && others === undefined
      ? undefined
      : Object.assign({ disabled: false, value: value }, others);
  }
  getAll() {
    return {
      state: this.state,
      runningState: this.runningState,
    };
  }
}
const RdxFormContext = (props) => {
  const { state, children, initializeState, onChange } = props;
  const innerStateRef = useRef(new FormStore({ state: {}, runningState: {} }));
  const contextRef = useRef(null);
  const errorContextRef = useRef(new ErrorContextClass());
  let isUnderControl = false;
  // 判断受控与非受控
  if (state) {
    isUnderControl = true;
  }
  return React__default.createElement(
    RdxContext,
    {
      withRef: contextRef,
      state: isUnderControl
        ? {
            state: state,
            runningState: innerStateRef.current.runningState,
          }
        : undefined,
      initializeState: { state: initializeState || {}, runningState: {} },
      shouldUpdate: (preValue, nextValue) => {
        if (!preValue || !nextValue) {
          return true;
        }
        return preValue.value !== nextValue.value;
      },
      createStore: (data) => {
        return new FormStore(data);
      },
      onChange: (state, stateInstance) => {
        innerStateRef.current = stateInstance;
        onChange && onChange(state.state);
      },
    },
    React__default.createElement(
      ErrorContextInstance.Provider,
      { value: errorContextRef.current },
      children
    )
  );
};

registryRdxFormComponent('object', ObjectField);
registryRdxFormComponent('array', Array$1);

var BaseType;
(function(BaseType) {
  BaseType['Object'] = 'object';
  BaseType['Array'] = 'array';
  BaseType['String'] = 'string';
  BaseType['Number'] = 'number';
  BaseType['Boolean'] = 'boolean';
})(BaseType || (BaseType = {}));

function createMutators$1(value, onChange, infos) {
  const switchItem = (arr, preIndex, nextIndex) => {
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

const Array$2 = (props) => {
  const { value = [], onChange, children, name } = props;
  const { paths: parentPaths = [] } = useContext(PathContextInstance);
  const infos = getChlidFieldInfo(children);
  const { children: childrenInfos = [] } = infos;
  const { remove, moveDown, moveUp, add } = createMutators$1(
    value,
    onChange,
    infos
  );
  return React__default.createElement(
    StyleCard$1,
    null,
    React__default.createElement(
      Table,
      Object.assign(
        {
          dataSource: JSON.parse(JSON.stringify(value)),
          columns: [
            ...childrenInfos.map((item, colIndex) => ({
              dataIndex: item.xComponent,
              title: item.title,
              cell: (value, rowIndex) => {
                const currentPaths = [
                  ...parentPaths,
                  name,
                  rowIndex.toString(),
                ];
                return React__default.createElement(
                  PathContextInstance.Provider,
                  {
                    value: {
                      paths: currentPaths,
                    },
                  },
                  React__default.cloneElement(
                    item.child,
                    Object.assign(Object.assign({}, item.child.props), {
                      title: undefined,
                      key: `${rowIndex}-${item.name}`,
                    })
                  )
                );
              },
            })),
            {
              dataIndex: '____operation',
              title: '操作',
              cell: (v, index) => {
                const ReDefineButton = Button;
                // @ts-ignore
                return React__default.createElement(
                  'div',
                  { style: { display: 'flex' } },
                  React__default.createElement(
                    ReDefineButton,
                    { type: 'primary' },
                    React__default.createElement(Icon, {
                      onClick: () => {
                        remove(index);
                      },
                      style: { marginRight: 6 },
                      type: 'ashbin',
                    }),
                    React__default.createElement(Icon, {
                      onClick: () => {
                        moveUp(index);
                      },
                      style: { marginRight: 6 },
                      type: 'arrow-up',
                    }),
                    React__default.createElement(Icon, {
                      onClick: () => {
                        moveDown(index);
                      },
                      type: 'arrow-down',
                    })
                  )
                );
              },
            },
          ],
        },
        {}
      )
    ),
    React__default.createElement(
      StyledAdd$1,
      {
        onClick: () => {
          add();
        },
      },
      React__default.createElement(Icon, { type: 'add' })
    )
  );
};
const StyleEmpty$1 = styled.div`
  display: flex;
  flex-direction: center;
  align-items: center;
  justify-content: center;
`;
const StyleCard$1 = styled.div`
  box-shadow: none;
  border-width: 1px;
  border-style: solid;
  border-color: rgb(238, 238, 238);
  border-image: initial;
`;
const StyledAdd$1 = styled.div`
  padding: 10px;
  background: rgb(251, 251, 251);
  border-left: 1px solid rgb(220, 222, 227);
  border-right: 1px solid rgb(220, 222, 227);
  border-bottom: 1px solid rgb(220, 222, 227);
`;

// import JsonEditor from './components/JsonEditor';
// import TreeField from './components/TreeField';
// import ColorPicker from './components/ColorPicker';
function setup() {
  registryRdxFormComponents({
    string: Input,
    arrayTable: Array$2,
    select: Select,
    radio: Radio.Group,
    boolean: Switch,
    checkbox: (props) => {
      const { value, onChange } = props,
        rest = __rest(props, ['value', 'onChange']);
      return React__default.createElement(
        Checkbox,
        Object.assign({ checked: value, onChange: onChange }, rest)
      );
    },
  });
}
var XComponentType;
(function(XComponentType) {
  XComponentType['Select'] = 'select';
  XComponentType['Radio'] = 'radio';
  XComponentType['Checkbox'] = 'checkbox';
  XComponentType['Color'] = 'color';
  XComponentType['Json'] = 'json';
  XComponentType['JsonEditor'] = 'jsonEditor';
  XComponentType['Code'] = 'code';
  XComponentType['ArrayTable'] = 'arrayTable';
  XComponentType['Tree'] = 'tree';
})(XComponentType || (XComponentType = {}));

export {
  BaseGraph,
  BaseMap,
  BaseObject,
  BaseQueue,
  BaseType,
  CompareType,
  DepsType,
  END,
  FormLayout,
  FromItem,
  GLOBAL_DEPENDENCE_SCOPE,
  Graph,
  NodeStatus,
  POINT_RELEVANT_STATUS,
  PathContextInstance,
  CommonQueue as PreDefinedTaskQueue,
  RENDER_STATUS,
  RdxContext,
  RdxFormContext,
  RdxFormItem,
  RdxView,
  ReactionType,
  ReasonType,
  STATUS_TYPE,
  ScopeObject,
  ShareContextClass,
  ShareContextConsumer,
  ShareContextInstance,
  ShareContextProvider,
  StateUpdateType,
  Status,
  TASK_INIT_TYPE,
  TASK_PROCESS_TYPE,
  TaskEventType,
  XComponentType,
  arr2Map,
  batchUpdate,
  checkIsChange,
  checkIsModuleChange,
  checkTaskChange,
  cleanConfig,
  cleanRegistry,
  createBaseContext,
  createConfigMap,
  createDeliversMap,
  createGraphByGraphAndCircle,
  createMutators,
  debounce,
  findNotMaxWidgetEdge,
  findSameArray,
  get,
  getChlidFieldInfo,
  getChlidFieldInfos,
  getDefaultValue,
  getEmptyValue,
  getRegistry,
  globalThisPolyfill,
  graphAdapter,
  graphLibAdapter,
  initValue,
  isPromise,
  normalizeCol,
  normalizeSingle2Arr,
  point2WithWeightAdapter,
  registryRdxFormComponent,
  registryRdxFormComponents,
  removeCircleEdges,
  render,
  renderChildren,
  set,
  setup,
  toArr,
  union,
  useForceUpdate,
  useRdxReaction,
  useRdxState,
};
