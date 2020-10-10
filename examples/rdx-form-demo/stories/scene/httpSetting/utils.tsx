import { REQUEST_TYPE, RequestType } from './types';

export const jsonParse = (json) => {
  let v;
  try {
    v = JSON.parse(json);
  } catch (error) {
    throw new Error(`POST BODY 内容解析失败--${error.toString()}`);
  }
  return v;
};

export function parseGetParams(url: string) {
  try {
    const urlInstance = new URL(url);
    const keys = Array.from(urlInstance.searchParams.keys());
    const values = Array.from(urlInstance.searchParams.values());
    return keys.map((key, index) => ({
      key: key,
      value: values[index],
    }));  
  } catch (error) {
    return []
  }
  
}
export function parsePostParams(body) {
  return Object.keys(jsonParse(body)).map((key) => ({ key }));
}
export function parseParams(
  requestType: RequestType,
  urlstring: string,
  body: string
) {
  if (requestType === RequestType.GET) {
    return parseGetParams(urlstring);
  } else {
    return parsePostParams(body);
  }
}

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
export function toFields(data, formatter) {
  let res;
  try {
    const func = new Function('data', formatter);
    res = func(data);
  } catch (error) {
    console.warn('toFields error', error.toString());
  }
  return res;
}
export function mockResult(res: any, formatter: string, requestType: RequestType, url: string, body: string) {
  let fields = toFields(res, formatter) || [];
  fields = Object.keys(fields[0] || {});
  const params = parseParams(requestType, url, body);
  const innerParams = getInnerParams(fields, params);
  return {
    data: res,
    ...innerParams,
  };
}


export function object2param(obj) {
  if (!obj) {
    return '';
  }
  const strarr = [];
  for (const i in obj) {
    if (obj[i] !== undefined && obj[i] !== null) {
      strarr.push(`${i}=${obj[i]}`);
    }
  }
  return strarr.join('&');
}
