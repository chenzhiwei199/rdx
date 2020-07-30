import { IFieldDefineWithChild } from "./functions";
import { IFieldDefine } from "../global";
import React from "react";

export function renderChildren(itemRef: IFieldDefine & { children?: IFieldDefineWithChild[] }, children) {
  const { type, children: childrenInfo } = itemRef;
  let currentChildren = <></>;
  if (type === 'object') {
    currentChildren = childrenInfo.map((item) =>
      React.cloneElement(item.child, {
        ...item.child.props,
        key: item.child.props.name,
      })
    ) as any;
  } else {
    currentChildren =  React.cloneElement(children, {
      ...children.props,
      key: children.props.name,
    }) as any;
  }
  return currentChildren;
}