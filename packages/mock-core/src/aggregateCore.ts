export interface ICube {
  factTable?: any[];
  dimensions: string[];
  measures: { key: string; aggregateType: AggregateType }[];
}
export enum AggregateType {
  Count = 'count',
  Min = 'min',
  Max = 'max',
  Sum = 'sum',
  Avg = 'avg',
}
export interface Node {
  [key: string]: any;
  _rawData: any[];
}
export function aggregateData(config: ICube) {
  const { factTable, dimensions, measures } = config;
  return _aggreateData();
  function _aggreateData() {
    let arr: Node[] = [];
    for (let row of factTable) {
      // 找到对应的行
      const findIndex = arr.findIndex((item) => {
        return dimensions.every(
          (dimension) => item[dimension] === row[dimension]
        );
      });
      // 过滤有效的指标
      let measureDatas = {} as any;
      for (let measure of measures) {
        measureDatas[measure.key] = row[measure.key];
      }

      if (findIndex === -1) {
        // 过滤有效的维度
        let newRow = { _rawData: [] as any } as any;
        newRow._rawData.push(measureDatas);
        for (let dimension of dimensions) {
          newRow[dimension] = row[dimension];
        }
        arr.push(newRow);
      } else {
        arr[findIndex]._rawData.push(measureDatas);
      }
    }
    // 数据聚合计算
    return arr.map((item) => {
      const { _rawData, ...others } = item;
      return {
        ...others,
        ..._aggregateByType(_rawData),
      };
    });
  }
  function sum(slice, key) {
    let temp = 0;
    for (let row of slice) {
      temp += Number(row[key]) || 0;
    }
    return temp;
  }
  function _aggregateByType(slice = []) {
    let aggreData = {} as any;
    for (let measure of measures) {
      switch (measure.aggregateType) {
        case AggregateType.Sum:
          aggreData[measure.key] = sum(slice, measure.key);
          break;
        case AggregateType.Count:
          aggreData[measure.key] = slice.length;
          break;
        case AggregateType.Max:
          aggreData[measure.key] = Math.max(
            ...slice.map((item) => item[measure.key])
          );
          break;
        case AggregateType.Min:
          aggreData[measure.key] = Math.min(
            ...slice.map((item) => item[measure.key])
          );
          break;
        case AggregateType.Avg:
          aggreData[measure.key] = sum(slice, measure.key) / slice.length;
          break;
        default:
          throw '暂时不支持' + measure.aggregateType + '这种聚合方式';
      }
    }

    return aggreData;
  }
}
