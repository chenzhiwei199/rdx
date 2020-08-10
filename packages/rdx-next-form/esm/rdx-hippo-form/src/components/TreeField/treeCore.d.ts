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
export declare type LayoutData = LayoutNode & {
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
export default class CustomSymbolTree {
    layout: LayoutData[];
    relationMap: Map<string, TreeNode>;
    constructor(layout: LayoutData[]);
    map(callback: (node: LayoutData, paths: number[], index: number) => any): any;
    remove(path: number[]): LayoutData[];
    insert(prePaths: number[], nextPaths: number[]): void;
    move(prePaths: number[], nextPaths: number[]): LayoutData[];
}
export {};
