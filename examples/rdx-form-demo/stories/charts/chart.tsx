import React from 'react';

export interface INode {
  id: any;
  x: number;
  y: number;
}
export interface INodeRender {
  id: string;
}
export interface Edge {
  id: any;
  from: any;
  to: any;
}
export interface IBaseConfig {
  width?: number;
  height?: number;
  color?: string;
  extraWidth?: number;
}

export interface ISupplyChain {
  nodes: INode[];
  edges?: Edge[];
  left?: number;
  top?: number;
  nodeConfig?: IBaseConfig;
  edgeConfig?: IBaseConfig;
  svgConfig?: IBaseConfig;
  nodeRender?: (id: string) => React.ReactNode;
  edgeRender?: (id: string) => React.ReactNode;
}
function getTranslate(x: number, y: number) {
  return `translate(${x}, ${y})`;
}

export function arr2Map<T>(source: T[], getKey: (v: T) => string) {
  const m = new Map<string, T>();
  source.forEach((item) => {
    const key = getKey(item);
    m.set(key, item);
  });
  return m;
}

function createLayoutInfo(from: INode, to: INode, nodeInfo: IBaseConfig) {
  const { x: fromX, y: fromY } = from;
  const { x: toX, y: toY } = to;
  const { width, height } = nodeInfo;
  const xMiddle = Math.abs(fromX - toX);
  const yMiddle = Math.abs(fromY - toY);
  const xDistacne = xMiddle - width;
  const yDistacne = yMiddle - height;
  // 方向
  let isToRight = true;
  if (fromX - toX > 0) {
    isToRight = false;
  }
  const isContrast = isToRight ? 1 : -1;
  let isTurningPoint = false;
  if (toY - fromY > 0) {
    isTurningPoint = true;
  }
  const halfNodeWidth = width / 2;
  const halfNodeHeight = height / 2;
  return {
    xDistacne,
    yDistacne,
    isContrast,
    isTurningPoint,
    halfNodeWidth,
    halfNodeHeight,
    xMiddle,
    yMiddle,
  };
}
function getEdgeTranslate(from: INode, to: INode, nodeInfo: IBaseConfig, edgeInfo: IBaseConfig) {
  const { x: fromX, y: fromY } = from;
  const { xMiddle, yMiddle, isContrast, isTurningPoint } = createLayoutInfo(
    from,
    to,
    nodeInfo
  );
  return getTranslate(
    fromX + (isTurningPoint ? 0 : xMiddle / 2) * isContrast,
    // - edgeInfo.height / 2
    isTurningPoint?( fromY +  (yMiddle * 3) / 4) : (fromY -  nodeInfo.height / 4 )
  );
}
function getPath(
  from: INode,
  to: INode,
  nodeInfo: IBaseConfig,
  edgeInfo: IBaseConfig
) {
  const { extraWidth = 0 } = edgeInfo;
  const {
    isTurningPoint,
    isContrast,
    xDistacne,
    yMiddle,
    halfNodeHeight,
    halfNodeWidth,
  } = createLayoutInfo(from, to, nodeInfo);
  const { x, y } = getStartPoint(from, to, nodeInfo, edgeInfo);
  if (!isTurningPoint) {
    return `M ${x } ${y } h ${(xDistacne + extraWidth * 2) * isContrast } `;
  } else {
    return `M ${x} ${y } v ${yMiddle - 3 * nodeInfo.height / 4 } h${(xDistacne +
      halfNodeWidth) *
      isContrast}`;
  }
}
function getStartPoint(
  from: INode,
  to: INode,
  nodeInfo: IBaseConfig,
  edgeInfo: IBaseConfig
) {
  const { x: fromX, y: fromY } = from;
  const { extraWidth = 0 } = edgeInfo;
  const {
    isTurningPoint,
    isContrast,
    halfNodeHeight,
    halfNodeWidth,
  } = createLayoutInfo(from, to, nodeInfo);
  if (!isTurningPoint) {
    return {
      x: fromX   + (halfNodeWidth - extraWidth) * isContrast,
      y: fromY - halfNodeHeight / 2,
    };
  } else {
    return {
      x: fromX,
      y: fromY + halfNodeHeight,
    };
  }
}
export default function SupplyChain(props: ISupplyChain) {
  let {
    nodes,
    edges = [],
    nodeConfig = {
      width: 50,
      height: 50,
    },
    svgConfig = {
      width: 1000,
      height: 1000,
    },
    edgeConfig = {
      width: 50,
      height: 50,
    },
    left,
    top,
    nodeRender = (id) => (
      <div style={{ background: 'red', width: '100%', height: '100%' }}>
        {id}
      </div>
    ),
    edgeRender = (id) => (
      <div style={{ width: '100%', height: '100%', background: 'green' }}>
        {id}
      </div>
    ),
  } = props;
  const { width: nodeWidth, height: nodeHeight } = nodeConfig;
  const { width: edgeWidth, height: edgeHeight, color } = edgeConfig;
  if (left === undefined) {
    left = nodeWidth / 2;
  }
  if (top === undefined) {
    top = nodeHeight / 2;
  }
  const nodeMap = arr2Map(nodes, (node) => node.id);
  return (
    <svg
      width={svgConfig.width}
      height={svgConfig.height}
      style={{ border: '1px solid black' }}
    >
      <g transform={getTranslate(left, top)}>
        {nodes.map((node) => {
          const { x, y, id } = node;
          return (
            <g transform={getTranslate(x, y)}>
              <foreignObject
                x={-nodeWidth / 2}
                y={-nodeHeight / 2}
                width={nodeWidth}
                height={nodeHeight}
              >
                <div style={{ width: nodeWidth, height: nodeHeight }}>
                  {nodeRender(id)}
                </div>
              </foreignObject>
            </g>
          );
        })}
        {}
        {edges.map((edge) => {
          const { from, to, id } = edge;
          const fromNode = nodeMap.get(from);
          const toNode = nodeMap.get(to);
          const { x, y } = getStartPoint(
            fromNode,
            toNode,
            nodeConfig,
            edgeConfig
          );
          return (
            <>
              <g >
                <circle fill={color} cx={x} cy={y} r='10' />
              </g>
              <path
                fill={'transparent'}
                stroke={color}
                strokeWidth={4}
                d={getPath(fromNode, toNode, nodeConfig, { ...edgeConfig, extraWidth: edgeConfig.extraWidth - 20})}
              />
              <g transform={getEdgeTranslate(fromNode, toNode, nodeConfig, edgeConfig)}>
                <foreignObject
                  x={-edgeWidth / 2}
                  y={-edgeHeight / 2}
                  width={edgeWidth}
                  height={edgeHeight}
                >
                  <div style={{ width: edgeWidth, height: edgeHeight }}>
                    {edgeRender(id)}
                  </div>
                </foreignObject>
              </g>
            </>
          );
        })}
      </g>
    </svg>
  );
}
