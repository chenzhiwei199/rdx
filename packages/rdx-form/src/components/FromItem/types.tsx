import {DataModel, RdxState, RdxReset, ValueOrUpdater} from '@czwcode/rdx'
export type Join<K , P > = K extends string | number ? P extends string | number ?  `${K}${"."}${ P}` : never : never;
type valueof<T> = T[keyof T]
type ArrayCondition<Conditon, Success, Fail> = Conditon extends [] ? Success : Fail;

type KeyPath<D> =
  | []
  | (D extends Array<infer U>
      ? [number] | [number, ...KeyPath<U>]
      : D extends object
      ? valueof<{ [K in keyof D]: [K] | [K, ...KeyPath<D[K]>] }>
      : never)

type TGet <GData, GPath> = 
ArrayCondition<GPath, 
  GData,   
  GPath extends [infer First, ... infer Rest] 
  ? GData extends Array<infer Type> 
    ? First extends number 
      ? TGet<Type, Rest>
      : never
    : First extends keyof GData 
        ? TGet<GData[First], Rest>
        : never 
  : never
>
;
type StringReturnResolver<D> = D extends Join<infer A, infer B> ? [A, ...StringReturnResolver<B>]: [D];
type StringPathResolver<D> =  
  D extends Array<any> 
     ? never :
    D extends object 
      ? valueof<{
        [K in keyof D]: K | Join<K,StringPathResolver<D[K]>>
      }>
      : never
// type IPath<ISource, IValueType> = StringPathResolver<ISource>| KeyPath<ISource> | RdxNode<IValueType> 

type TPath<ISource, IValueType> =   StringPathResolver<ISource>| KeyPath<ISource>  | RdxState<IModel<IValueType>>
type TResult<ISource,IValueType, INode> =  ISource extends never ? IModel<IValueType> :INode extends string[]
? IModel<TGet<ISource, INode>>
: INode extends string
? IModel<TGet<ISource, StringReturnResolver<INode>>>
: INode extends RdxState<IModel<IValueType>>
? IModel<IValueType>
: never


/**
 * 视图状态
 */
export interface IModel<T> {
  value?: T;
  dataSource?: any[];
  visible?: boolean;
  disabled?: boolean;
  componentProps?: { [key: string]: any };
}





// @ts-ignore
export type RdxFormGet<ISource, IValueType> = <INode extends TPath<ISource, IValueType>>(node:  INode) => TResult<ISource, IValueType,  INode>
// @ts-ignore
export type RdxFormSet<ISource, IValueType> = <INode extends TPath<ISource, IValueType>>(
  node: INode,
  value:ValueOrUpdater<TResult<ISource, IValueType, INode>>
) => void;

export type IRdxFormComputeGet<IValueType, ISource> = (config: {
  id: string;
  value: IModel<IValueType>;
  /**
   * 当事件冲突时触发时候的回调
   *
   * @memberof ReactionContext
   */
  callbackMapWhenConflict: (callback: () => void) => void;
  get: RdxFormGet<ISource, IValueType>;
}) => DataModel<IModel<IValueType>>;

export type IRdxFormComputeSet<IValueType, ISource> = (
  config: {
    id: string;
    value: IModel<IValueType>;
    get: RdxFormGet<ISource, IValueType>;
    set: RdxFormSet<ISource, IValueType>;
    reset: RdxReset;
  },
  newValue: IModel<IValueType>
) => void;



export type RuleDetail = (value, context) => Promise<string | undefined>;