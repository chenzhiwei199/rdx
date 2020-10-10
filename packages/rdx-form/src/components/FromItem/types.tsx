import {DataModel, RdxNode, RdxReset, ValueOrUpdater} from '@czwcode/rdx'
type Join<K , P > = K extends string | number ? P extends string | number ?  `${K}${"."}${ P}` : never : never;
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

type TPath<ISource, IValueType> =   StringPathResolver<ISource>| KeyPath<ISource>  | RdxNode<IModel<IValueType>>
type TResult<ISource,IValueType, INode> =  ISource extends never ? IModel<IValueType> :INode extends string[]
? IModel<TGet<ISource, INode>>
: INode extends string
? IModel<TGet<ISource, StringReturnResolver<INode>>>
: INode extends RdxNode<IModel<IValueType>>
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

export type IRdxFormWatcherGet<IValueType, ISource> = (config: {
  id: string;
  get: RdxFormGet<ISource, IValueType>;
}) => DataModel<IModel<IValueType>>;

export type IRdxFormWatcherSet<IValueType, ISource> = (
  config: {
    id: string;
    value: IModel<IValueType>;
    get: RdxFormGet<ISource, IValueType>;
    set: RdxFormSet<ISource, IValueType>;
    reset: RdxReset;
  },
  newValue: IModel<IValueType>
) => void;

  
interface HttpSettingState {
  // requestInfo: RequestInfo;
  requestProcess: RequestProcess;
  resultProcess: ResultProcess;
}
interface ResultProcess {
  useFilter: boolean;
  dataField: string;
  filter: string;
}
interface RequestProcess {
  useParamsTransform: boolean;
}
interface RequestInfo {
  requestType: string;
  url: string;
  body: string;
}
