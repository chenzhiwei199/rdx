export const CUSTOM_TASK_TYPE = {
  REQUEST_INFO: 'REQUEST_INFO',
  REQUEST_INFO_CONSOEL: 'REQUEST_INFO_CONSOEL',
  REQUEST_URL: 'REQUEST_URL',
  USE_REQUEST_PARAMS_TRANSFORM: 'USE_PARAMS_TRANSFORM',
  SEND: 'SEND',
  NAME: 'NAME',
  GET: {
    PARAMS: 'GET_PARAMS',
    GET_TO_PARAMS: 'GET_TO_PARAMS'
  },
  POST: {
    MAIN: 'POST MAIN',
    POST_BODY: 'POST_BODY',
    POST_BODY_CONSOLE: 'POST_BODY_CONSOLE',
    POST_BODY_PARSER: 'POST_BODY_PARSER',
    POST_TO_BODY: 'POST_TO_BODY',
    POST_TO_PARAMS: 'POST_TO_PARAMS'
  },
  RESULT: {
    FILTER_TO_RESULT: 'FILTER_TO_RESULT',
    FILTER_TO_RESULT_DATA_FIELD: 'FILTER_TO_RESULT_DATA_FIELD',
    DATA: 'DATA',
    AFTER_FILTER_DATA: 'AFTER_FILTER_DATA',
    FIELD: 'FIELD',
    WHERES: 'WHERES',
    RESULT_BY_SPECIFY: 'RESULT_BY_SPECIFY',
    USE_RESULT_FILTER: 'USE_RESULT_FILTER',
    RESULT_FILTER_VISIBLE: 'RESULT_FILTER_VISIBLE',
  }
};

export enum RequestType {
  GET = 'GET',
  POST = 'POST',
}
export const COLUMN_TYPE = {
  DIMENSION: 'dimension',
  INDICATOR: 'indicator'
};


export const REQUEST_TYPE = [RequestType.GET, RequestType.POST];
export interface RequestInfoParams {
  key: string;
  value: string;
}

export interface IHttpSettingValue {
  requestInfo: {
    url: string;
    requestType: RequestType;
    params: RequestInfoParams[];
    body: string
  };
  requestProcess: {
    useParamsTransform: boolean;
  };
  resultProcess: {
    useFilter: boolean;
    filter: string;
    dataField: string;
  };
  post: {
    content: string;
  };
}