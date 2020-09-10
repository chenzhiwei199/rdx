import mockData, { dimensions, measures } from './mockData';
import { AggregateType, aggregateData, ICube } from './aggregateCore';
import { IQueryConfig } from './types';
import { dataFilter } from './utils';

function mockRequest(data): Promise<{ success: boolean, data: any}> {
  return new Promise((resolve, reject) => {
    if(false) {
      reject("数据返回错误啦")
    } else {
      setTimeout(() => {
        resolve({
          success: true,
          data: data
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
/**
 *
 * dimensions 单据日期,地区名称,业务员名称,客户分类,客户名称,存货名称,部门名称,存货分类,存货编码,业务员编码,订单号,客户编码,部门编码,订单明细号
 * measures "税费,不含税金额,订单金额,利润,单价,数量"
 * @export
 * @param {IQueryConfig} config
 * @returns
 */
export function getData(config: IQueryConfig) {
  const { filters, orders, ...rest } = config;
  return mockRequest(
    aggregateData({
      factTable: dataFilter(mockData, filters),
      ...rest,
    })
  );
}

export function getDimensions() {
  return mockRequest(
    dimensions
  );
}

export function getMeasures() {
  return mockRequest(
    measures
  );
}
