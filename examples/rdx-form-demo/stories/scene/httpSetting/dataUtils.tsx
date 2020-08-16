import axios from 'axios';
import { RequestType, IHttpSettingValue } from './types';
import { object2param } from './utils';

const axiosInstance = axios.create({
  transformResponse(data) {
    data = JSON.parse(data);
    return data;
  },
});
export const getInnerParams = (fields, params) => {
  return {
    wheres: params.map((item) => ({
      ...item,
      op: '=',
    })),
    sorts: fields.map((item) => ({
      key: item,
      desc: true,
    })),
    pageIndex: 0,
    pageSize: 100,
  };
};

export const get2ParamsExplain = (data, value) => {
  let fnString = value || 'return data.wheres';
  try {
    const fn = Function('data', fnString);
    return fn(data);
  } catch (error) {
    console.warn(`${error.toString()}`);
  }
};

export function postParamsParser(parseBody, postBody) {
  return () => {
    let fnString = parseBody || 'return Object.keys(data)';
    try {
      const fn = Function('data', fnString);
      return fn(JSON.parse(postBody));
    } catch (error) {}
  };
}
function createParams(useParamsTransform, wheres, pageIndex, pageSize, sorts) {
  let p = useParamsTransform
    ? {
        pageIndex,
        pageSize,
        sorts: JSON.stringify(sorts),
      }
    : {};
  wheres.forEach((where) => {
    p[where.key] = where.value;
  });
  return p;
}
export function simpleFetch(
  httpInfo: IHttpSettingValue,
  realFetchOptions: IRealFetchOptions,
  token
) {
  // const defaultOptions = {
  //   useParamsTransform:
  //     httpInfo.requestProcess && httpInfo.requestProcess.useParamsTransform,
  //   requestType: httpInfo.requestInfo.requestType,
  //   useFilter: httpInfo.resultProcess.useFilter,
  //   filter: httpInfo.resultProcess.filter,
  //   dataField: httpInfo.resultProcess.dataField,
  //   url: httpInfo.requestInfo.url,
  //   content: httpInfo.post.content,
  // };
  return fetchData({
    defaultOptions: httpInfo,
    realFetchOptions: realFetchOptions,
    token: token,
  });
}

export interface IRealFetchOptions {
  isRealFetch: boolean;
  wheres?: { key: string; value: any }[];
  sorts?: { key: string; desc: boolean }[];
  pageIndex?: number;
  pageSize?: any;
}

// {
//   requestType: RequestType;
//   url: string;
//   content?: any;
//   useFilter: boolean;
//   filter: string;
//   body: string;
//   dataField: string;
//   useParamsTransform: boolean;
// };
export interface IFetchOptions {
  defaultOptions: IHttpSettingValue;
  realFetchOptions?: IRealFetchOptions;
  token?: any;
  isFormatter?: boolean;
}
/**
 * demo
 * fetchData(
                {
                  requestType: config.requestInfo.requestType,
                  url: config.requestInfo.url,
                  content: config.post.content
                },
                {
                  isRealFetch: true,
                  wheres: [{ key: 'test', value: '22222' }],
                  sorts: [{ key: 't', desc: true }],
                  pageIndex: 10,
                  pageSize: 20
                }
              )
                .then(res => {
                  
                })
                .catch(error => {
                  
                })
 * @param {*} defautOptions
 * @param {*} realFetchOptions
 * @param {*} token
 */
export function fetchData(options: IFetchOptions) {
  const {
    defaultOptions,
    realFetchOptions = {} as IRealFetchOptions,
    token,
    isFormatter = true,
  } = options;
  const commonConfig = {
    withCredentials: true,
    cancelToken: token,
  };
  const config = {
    ...commonConfig,
    headers: { 'content-type': 'application/json' },
  };
  const { requestInfo, resultProcess, requestProcess } = defaultOptions;
  const { url, requestType, body } = requestInfo;
  const { useFilter, filter, dataField } = resultProcess;
  const { useParamsTransform } = requestProcess;
  const {
    isRealFetch = false,
    wheres = [],
    pageIndex = 1,
    pageSize = 100,
    sorts = [],
  } = realFetchOptions;
  let promise;
  if (!url) {
    throw new Error('url 不能为空');
  }
  if (!isRealFetch) {
    if (requestType === RequestType.GET) {
      promise = axiosInstance.get(url, commonConfig);
    } else {
      promise = axiosInstance.post(url, body, config);
    }
  } else {
    const urlObj = new URL(url);
    const baseUrl = urlObj.origin + urlObj.pathname;
    const p = createParams(
      useParamsTransform,
      wheres,
      pageIndex,
      pageSize,
      sorts
    );
    if (requestType === RequestType.GET) {
      promise = axiosInstance.get(
        `${baseUrl}?${object2param(p)}`,
        commonConfig
      );
    } else {
      promise = axiosInstance.post(baseUrl, p, {
        ...config,
      });
    }
  }
  if (!isFormatter) {
    return promise.then((res) => res.data);
  }
  return promise.then((res) => {
    if (useFilter) {
      res = {
        data: res.data,
        wheres,
        sorts,
        pageIndex,
        pageSize,
      };
    }
    return parseResult({
      result: res,
      useFilter,
      filterBody: filter,
      dataField,
    });
  });
}

interface IParseResultOptions {
  result: any;
  useFilter: boolean;
  filterBody: string;
  dataField: string;
}
export function parseResult(options: IParseResultOptions) {
  let {
    result,
    useFilter,
    filterBody = 'return data.data.data',
    dataField,
  } = options;
  if (!dataField) {
    dataField = 'data';
  }
  if (!useFilter) {
    return result[dataField];
  }
  const fn = new Function('data', filterBody);
  return fn(result);
}
