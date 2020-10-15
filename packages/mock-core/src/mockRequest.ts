import mockData, { dimensions, measures } from './mockData';
import { AggregateType, aggregateData, ICube } from './aggregateCore';
import { Filter, Filters, IQueryConfig } from './types';
import { dataFilter } from './utils';
function mockRequest(data): Promise<{ success: boolean; data: any }> {
  return new Promise((resolve, reject) => {
    if (false) {
      reject('数据返回错误啦');
    } else {
      setTimeout(() => {
        resolve({
          success: true,
          data: data,
        });
      }, 1000 + Math.random() * 1000);
    }
  });
}
export function getMetas() {
  return mockRequest(Object.keys(mockData[0]));
}

export function getDimensionTable(key: string) {
  return mockRequest(
    mockData.map((item) => {
      return {
        label: item[key],
        id: item[key],
      };
    })
  );
}
class Source {
  cancelFlag: boolean = false;
  token = () =>{
    return this.cancelFlag
  }
  cancel = () => {
    this.cancelFlag = true
  }
}
class _CancelToken {
  source() {
    return new Source()
  }
}
const CancelFlag = 'CancelFlag'
export const isErrorCancel =  (error) => {
  return error.message === CancelFlag
}
export const CancelToken = new _CancelToken()
/**
 *
 * dimensions 单据日期,地区名称,业务员名称,客户分类,客户名称,存货名称,部门名称,存货分类,存货编码,业务员编码,订单号,客户编码,部门编码,订单明细号
 * measures "税费,不含税金额,订单金额,利润,单价,数量"
 * @export
 * @param {IQueryConfig} config
 * @returns
 */
export function getData(config: IQueryConfig, token?: () => boolean) {
  const { filters, orders, ...rest } = config;
  const fetchData =aggregateData({
    factTable: dataFilter(mockData, filters),
    ...rest,
  })
  const data =mockRequest(
    fetchData
  );
  console.log("searchData getData", JSON.stringify(config), fetchData)
  if(token && token()) {
    console.warn("Cancel 啦啦啦")
    throw new Error(CancelFlag)
  }
  return data
}
export function getDimension(config: { dimensions: string; filters?: Filters }) {
  console.log('getDimension config: ', config);
  const { filters, dimensions } = config;
  const vaildData  =dataFilter(mockData, filters)
  return mockRequest(
    vaildData.map((item) => ({
      label: item[dimensions],
      value: item[dimensions],
    }))
  );
}

export function getDimensions() {
  return mockRequest(dimensions);
}

export function getMeasures() {
  return mockRequest(measures);
}
