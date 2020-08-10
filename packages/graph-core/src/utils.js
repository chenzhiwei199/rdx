/**
 * 根据依赖，需要发送通知的下游节点
 * @param config
 */
export function createDeliversMap(config) {
    const deliversMap = new Map();
    for (const item of config) {
        for (const dep of item.deps || []) {
            const currentRelations = deliversMap.get(dep.id);
            if (currentRelations) {
                currentRelations.push(item.key);
            }
            else {
                deliversMap.set(dep.id, [item.key]);
            }
        }
    }
    return deliversMap;
}
// console.log(createDeliversMap([{key: '1', deps: undefined }, { key: '2', deps: ['1']}, {key: '3', deps: ['2']}]));
export function createConfigMap(config) {
    return config.reduce((currentMap, item) => {
        currentMap.set(item.key, item);
        return currentMap;
    }, new Map());
}
export function normalizeSingle2Arr(point) {
    if (!Array.isArray(point)) {
        return [point];
    }
    else {
        return point;
    }
}
export function arr2Map(source, getKey) {
    const m = new Map();
    source.forEach((item) => {
        const key = getKey(item);
        m.set(key, item);
    });
    return m;
}
export function union(source, byKey = (t) => t) {
    const arr = [];
    const m = new Map();
    source.forEach(item => {
        const key = byKey(item);
        if (!m.has(key)) {
            arr.push(item);
            m.set(key, item);
        }
    });
    return arr;
}
export default {
    normalizeSingle2Arr,
    createConfigMap,
    createDeliversMap,
};
