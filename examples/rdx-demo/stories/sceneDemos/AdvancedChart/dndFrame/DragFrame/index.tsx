import React, { useRef } from 'react';
import {
  ConnectDragSource,
  useDrag,
  useDrop,
  ConnectDropTarget,
} from 'react-dnd';
import { DataSourceType, DataConfig } from '../../types';
import ReactDOM from 'react-dom';

interface DataSourceDragFrameProps {
  dataConfig: DataConfig;
  onDragEnd?: (dataConfig: DataConfig) => void;
  move?: (preIndex: number, currentIndex: number) => void;
  index?: number;
  canDrop?: boolean;
  children?: React.ReactNode;
}

/**
 * Frame component which surrounds each widget.
 */
export interface DragFrameDndProps {
  connectDragSource: ConnectDragSource;
  connectDropTarget: ConnectDropTarget;
  isDragging: boolean;
}

export default function DragFrame(
  props: DataSourceDragFrameProps & { children?: React.ReactNode }
) {
  const { dataConfig, index, children, onDragEnd, canDrop, move } = props;
  const {
    domainType,
    domainName,
    code,
    label,
    type = DataSourceType,
  } = dataConfig;
  const ref = useRef(null);
  const [collectedProps, drag] = useDrag<any, any, any>({
    item: {
      type: type,
      domainType,
      domainName,
      code,
      label,
      index,
    } as DataConfig,
    end(xxx: DataSourceDragFrameProps, monitor) {
      onDragEnd && onDragEnd(props.dataConfig);
    },
    canDrag() {
      return true;
    },
  });
  const [collectedDropProps, drop] = useDrop<any, any, any>({
    accept: type,
    canDrop: (props: DataSourceDragFrameProps) => {
      return canDrop === undefined ? true : canDrop;
    },
    hover: (props: DataSourceDragFrameProps, monitor) => {
      if (!canDrop) {
        return;
      }
      const item = monitor.getItem();
      const dragIndex = item.index;
      const hoverIndex = index;
      // Don't replace items with themselves
      if (dragIndex === hoverIndex) {
        return;
      }
      if (!dragIndex && dragIndex !== 0) {
        return;
      }
      // Determine rectangle on screen
      const hoverBoundingRect = (ReactDOM.findDOMNode(
        ref.current
      ) as HTMLDivElement).getBoundingClientRect();
      // Get vertical middle
      const hoverMiddleY =
        (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      const hoverMiddleX =
        (hoverBoundingRect.right - hoverBoundingRect.left) / 2;
      // Determine mouse position
      const clientOffset = monitor.getClientOffset();
      // Get pixels to the top
      const hoverClientY = clientOffset.y - hoverBoundingRect.top;
      const hoverClientX = clientOffset.x - hoverBoundingRect.left;
      // Only perform the move when the mouse has crossed half of the items height
      // When dragging downwards, only move when the cursor is below 50%
      // When dragging upwards, only move when the cursor is above 50%
      // Dragging downwards
      if (
        dragIndex < hoverIndex &&
        hoverClientY < hoverMiddleY
        // hoverClientX < hoverMiddleX
      ) {
        return;
      }
      // Dragging upwards
      if (
        dragIndex > hoverIndex &&
        hoverClientY > hoverMiddleY
        // hoverClientX > hoverMiddleX
      ) {
        return;
      }
      // Time to actually perform the action
      if (move) {
        move(dragIndex, hoverIndex);
      }

      // Note: we're mutating the monitor item here!
      // Generally it's better to avoid mutations,
      // but it's good here for the sake of performance
      // to avoid expensive index searches.
      item.index = hoverIndex;
    },
  });
  drag(drop(ref));
  return <div ref={ref}>{children}</div>;
}
