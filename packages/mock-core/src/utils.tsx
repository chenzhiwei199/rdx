import { Filters, Operator } from './types';

function equal(target, current, op: Operator): boolean {
  switch (op) {
    case Operator.equals:
      return target === current;
    case Operator.notEquals:
      return target !== current;
      case Operator.contains:
        return current.includes(target) ;
      case Operator.notContains:
        return !current.includes(target) ;
    default:
      throw new Error('暂不支持操作符');
  }
}
export function dataFilter(data: any[], filters: Filters = []) {
  return data.filter((row) => {
    let willFilter = false;

    filters.forEach((rowFilter) => {
      if (Array.isArray(rowFilter)) {
        // or filter
        if (
          rowFilter.every((orFilter) => {
            return !equal(
              row[orFilter.member],
              orFilter.values,
              orFilter.operator
            );
          })
        ) {
          willFilter = true;
        }
      } else {
        // and filter
        if (
          !equal(row[rowFilter.member], rowFilter.values, rowFilter.operator)
        ) {
          willFilter = true;
        }
      }
    });
    return !willFilter;
  });
}
