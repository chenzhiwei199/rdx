import React from 'react';
import {
  useDrop,
  DropTarget,
  DropTargetMonitor,
  ConnectDropTarget,
  DropTargetSpec,
} from 'react-dnd';
import { DataSourceType, DataConfig } from '../../types';
import { CSSProperties } from 'react';

export interface InnerDropFrameDndProps {
  connectDropTarget: ConnectDropTarget;
  isOver: boolean;
  canDrop: boolean;
  dropItem: DataConfig;
}
export interface DropFrameDndProps {
  style?: CSSProperties;
  children?: React.ReactNode;
  onDrop: (dataConfig: DataConfig) => void;
  canDropFunction?: (data: DataConfig) => boolean;
  tipsRender?: (data: DataConfig) => void;
}
export default (props: DropFrameDndProps & { children: React.ReactNode }) => {
  const { children, tipsRender, canDropFunction, onDrop } = props;
  const [{ isOver, canDrop, dropItem }, drop] = useDrop<
    any,
    InnerDropFrameDndProps,
    any
  >({
    accept: DataSourceType,
    drop: (props: DropFrameDndProps, monitor: DropTargetMonitor) => {
      onDrop(monitor.getItem());
      return undefined;
    },
    canDrop(props: DropFrameDndProps, monitor: DropTargetMonitor) {
      return canDropFunction ? canDropFunction(monitor.getItem()) : true;
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
      dropItem: monitor.getItem() as DataConfig,
    }),
  });

  const style = { ...props.style } as CSSProperties;
  if (!canDrop && isOver) {
    style.border = '1px solid red';
  } else if (canDrop) {
    style.border = '1px solid #23a3ff';
  } else if (isOver) {
    style.background = '#FFC0CB';
    style.opacity = 0.3;
  }
  return (
    <div ref={drop} style={style}>
      {children}
      {tipsRender && isOver && tipsRender(dropItem)}
    </div>
  );
};
