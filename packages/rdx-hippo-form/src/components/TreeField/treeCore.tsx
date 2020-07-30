import _ from 'lodash';
/**
 * feature
 * 1. parent
 * 2. insertBefore
 * 3. insertAfter
 * 4. appendChild
 * 5. childrenCount
 * 6. childrenToArray
 * 7. firstChild
 * 8. previousSibling
 * 9. nextSibling
 */

export interface LayoutNode {
  [key: string]: any;
}
export type LayoutData = LayoutNode & {
  children?: LayoutData[];
};
interface TreeNode {
  data: LayoutData;
  info: {
    paths: number[];
    parent: LayoutData | null;
    previousSibling: LayoutData;
    nextSibling: LayoutData;
    children: LayoutData[];
    index: number;
  };
}
function generateTreeInfo(
  root: Map<string, TreeNode>,
  current: LayoutData[],
  parent?: LayoutData,
  index?: number,
  paths: number[] = []
) {
  if (current && current.length > 0) {
    current.forEach((item, index) => {
      const currentPath = [...paths, index];
      root.set(currentPath.join('.'), {
        data: item,
        info: {
          index,
          paths: currentPath,
          parent: parent,
          children: item.children,
          nextSibling: parent ? parent.children[index + 1] : null,
          previousSibling: parent ? parent.children[index - 1] : null,
        },
      });
      generateTreeInfo(root, item.children, item, index, currentPath);
    });
  }

  return root;
}
export default class CustomSymbolTree {
  layout: LayoutData[];
  relationMap: Map<string, TreeNode>;
  constructor(layout: LayoutData[]) {
    this.layout = layout;
    this.relationMap = generateTreeInfo(new Map(), this.layout, { children:  this.layout});
  }
  map(callback: (node: LayoutData, paths: number[], index: number) => any) {
    const mapDescendants = (data, paths: number[]) => {
      return data.map((item, index) => {
        const currentPath = [...paths, index];
        return {
          ...callback(
            item,
            this.relationMap.get(currentPath.join('.')).info.paths,
            this.relationMap.get(currentPath.join('.')).info.index,
          ),
          children: item.children
            ? mapDescendants(item.children, currentPath)
            : undefined,
        };
      });
    };
    
    return mapDescendants(this.layout, []);
  }

  remove(path: number[]) {
    const children = this.relationMap.get(path.join('.')).info.parent.children
    children.splice(path[path.length - 1], 1)
    return this.layout
  }
  insert(prePaths: number[], nextPaths: number[]) {
    const dragNode  = this.relationMap.get(prePaths.join('.')).data
    const isSameDeep = prePaths.length === nextPaths.length
    if(isSameDeep) {
      const children = this.relationMap.get(nextPaths.join('.')).info.parent.children
      const temp = children.splice(nextPaths[nextPaths.length - 1], 1, dragNode)
      children.splice(prePaths[prePaths.length - 1], 1, temp[0])
    } else {
      const temp = this.relationMap.get(prePaths.join('.')).info.parent.children.splice(prePaths[prePaths.length - 1], 1)
      const nextParent = this.relationMap.get(nextPaths.slice(0, nextPaths.length - 1).join('.')).data
      if(!nextParent.children) {
        nextParent.children = [temp[0]]
      } else {
        nextParent.children.splice(nextPaths[nextPaths.length - 1], 1, temp[0])
      }
      
    }
    
  }
  move(prePaths: number[], nextPaths: number[] ) {
    this.insert(prePaths, nextPaths)
    return [...this.layout]
  }
}
