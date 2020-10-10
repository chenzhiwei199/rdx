import { registryRdxFormComponent } from '../core/registry';
import ObjectField from './ObjectField';
import ArrayCardField from './ArrayCardField';
export * from './ArrayCardField';
export * from './FormLayout';
export * from './FromItem';
export { default as RdxFormContext } from './RdxFormContext';
export { default as Preview } from './Preview';
registryRdxFormComponent('object', ObjectField as any);
registryRdxFormComponent('array', ArrayCardField as any);

// type valueof<T> = T[keyof T];
// type KeyPath<D> =
//   | []
//   | (D extends Array<infer U>
//       ? [number] | [number, ...KeyPath<U>]
//       : D extends object
//       ? valueof<{ [K in keyof D]: [K] | [K, ...KeyPath<D[K]>] }>
//       : never);

// const a = { a: { b: { c: { d: { e: 1, f: { g: '2222'} } } } } };
// const b = { a: { b: 1, c: { e: 1, f: { g:3, h: { i: 4}}}}, d: 3 };
// const bb = { a: '1', b: { c: 2}}
// type Join<K, P> = K extends string | number ? P extends string | number ? `${K}${"."}${P}`: never : never;
// type Y<D> = D extends object ? valueof<{ [K in keyof D]: K | Join<K, Y<D[K]>>}> : never


// type b = keyof (typeof a)

// type c = KeyPath<typeof a>;
// type g = KeyPath<typeof b>;
// type T<D> = D extends object ?
// const d =  ["a", "b"]
// type f = typeof d
// type h = keyof c;





// type Join3<K> =  K extends string[] ? keyof K extends number ? `${keyof K}.${K[]}`

// type KeyPath2<D> =
//   | []
//   | (D extends Array<infer U>
//       ? [number] | [number, ...KeyPath<U>]
//       : D extends object
//       ? valueof<{ [K in keyof D]: K | [K, ...KeyPath<D[K]>] }>
//       : never);


