import { Point } from './typings/global';
import graphlib from 'graphlib'
/**
 * 根据依赖，需要发送通知的下游节点
 * @param config
 */
export function createDeliversMap(config: Point[]) {
  const deliversMap = new Map() as Map<string, string[]>;
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

export function createConfigMap<T extends { key: string}>(config: T[]) {
  return config.reduce((currentMap, item) => {
    currentMap.set(item.key, item);
    return currentMap;
  }, new Map<string, T>());
}

export function normalizeSingle2Arr<T>(point: T | T[]) {
  if (!Array.isArray(point)) {
    return [point];
  } else {
    return point;
  }
}
export function arr2Map<T>(source: T[], getKey: (v: T) => string) {
  const m  =new Map<string, T>()
  source.forEach((item) => {
    const key  = getKey(item)
    m.set(key, item)
  })
  return m
}
export function  union<T>(source: T[], byKey: (v: T) => string = (t: any) => t ) {
  const arr = []
  const m = new Map()
  source.forEach(item => {
    const key = byKey(item)
    if(!m.has(key)) {
      arr.push(item)
      m.set(key, item)
    }
  })
  return arr
}

export interface Data {
  id: string;
  deps?: { id: string; weight?: number }[];
}


export default {
  normalizeSingle2Arr,
  createConfigMap,
  createDeliversMap,
};



