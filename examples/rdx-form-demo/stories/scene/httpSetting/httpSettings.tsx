import React from 'react';
import { RequestType, REQUEST_TYPE, IHttpSettingValue } from './types';
import {
  RdxFormContext,
  RdxFormItem,
  FormLayout,
  DepsType,
  IEditorWithInAndOut,
  RdxView,
  XComponentType,
  BaseType,
} from '@czwcode/rdx-next-form';
import { Input } from '@alifd/next';
import { Button } from '@alifd/next';
import { parseGetParams, mockResult, jsonParse } from './utils';
import { fetchData, parseResult } from './dataUtils';

export interface IHttpSetting {
  value: IHttpSettingValue;
  onChange: (value: IHttpSettingValue) => void;
}

export enum UrlParmasType {
  Key = 'key',
  Value = 'value',
}

export function createNewUrl(
  url: string,
  params: { key: string; value: string }[]
) {
  const urlInstance = new URL(url);
  const parmasString = params
    .map((item) => `${item.key}=${item.value}`)
    .join('&');
  const pathname = urlInstance.pathname === '/' ? '' : urlInstance.pathname;
  return `${urlInstance.origin}${pathname}${
    parmasString ? '?' + parmasString : ''
  }`;
}
export function updateUrl(
  url: string,
  type: UrlParmasType,
  key: string,
  index: string,
  value: string
) {
  const params = parseGetParams(url);
  if (parseInt(index) >= params.length) {
    params.push({
      key: '',
      value: '',
      [key]: value,
    } as any);
  } else {
    params[index][key] = value;
  }

  return createNewUrl(url, params);
}
export default function HttpSetting(props: IHttpSetting) {
  const { value, onChange } = props;
  const compute = (value, context) => {
    const { id, nextById, depsValues } = context;
    const ids = id.split('.');
    const currentIndex = ids[ids.length - 2];
    const currentKey = ids[ids.length - 1];
    const [urlObj] = depsValues;
    const newUrl = updateUrl(
      urlObj.value,
      UrlParmasType.Key,
      currentKey,
      currentIndex,
      value
    );
    nextById('requestInfo.url', {
      ...urlObj,
      value: newUrl,
    });
  };
  return (
    <RdxFormContext state={value} onChange={onChange}>
      {/* <FormLayout> */}
      <RdxFormItem name='requestInfo' type={BaseType.Object} title='请求配置'>
        <Input.Group>
          <RdxFormItem
            name='requestType'
            type={BaseType.String}
            dataSource={REQUEST_TYPE.map((item) => ({
              label: item,
              value: item,
            }))}
            xComponent={XComponentType.Select}
          ></RdxFormItem>
          <RdxFormItem
            name='url'
            type={BaseType.String}
            reaction={(context) => {
              const { value } = context;
              new URL(value.value);
            }}
            rules={[
              async (value) => {
                try {
                  new URL(value);
                  return;
                } catch (error) {
                  return '请填入合法链接';
                }
              },
            ]}
            componentProps={{ style: { width: 320 } }}
          ></RdxFormItem>
          <RdxView
            id='data'
            render={(context) => {
              const { refresh } = context;
              return (
                <Button
                  type='primary'
                  onClick={() => {
                    refresh();
                  }}
                >
                  查询
                </Button>
              );
            }}
            reaction={async (context) => {
              try {
                const { value, updateState, state } = context;
                const res = await fetchData({
                  defaultOptions: state.state,
                  isFormatter: false,
                });
                updateState({ ...(value as any), value: res });
              } catch (error) {}
            }}
            areEqualForTask={() => {
              return false;
            }}
          ></RdxView>
        </Input.Group>

        <RdxFormItem
          deps={[{ id: 'url' }]}
          reaction={(context) => {
            const { updateState, value, id, depsValues } = context;
            const [urlObj] = depsValues;
            updateState({
              ...value,
              visible: true,
              value: parseGetParams(urlObj.value),
            });
          }}
          name='params'
          title='参数配置'
          compute={(value, context) => {
            const { depsValues, nextById } = context;
            const [urlObj] = depsValues;
            nextById('requestInfo.url', {
              ...urlObj,
              value: createNewUrl(urlObj.value, value),
            });
          }}
          xComponent={XComponentType.ArrayTable}
          type={BaseType.Array}
        >
          <RdxFormItem type={BaseType.Object} default={{ key: '', value: '' }}>
            <RdxFormItem
              deps={[{ id: 'requestInfo.url', type: DepsType.Absolute }]}
              compute={compute}
              title='key'
              default={'1'}
              name='key'
              type={BaseType.String}
            ></RdxFormItem>
            <RdxFormItem
              deps={[{ id: 'requestInfo.url', type: DepsType.Absolute }]}
              compute={compute}
              title='value'
              default={'2'}
              name='value'
              type={BaseType.String}
            ></RdxFormItem>
          </RdxFormItem>
        </RdxFormItem>
        <RdxFormItem
          name='body'
          defaultVisible={false}
          type={BaseType.String}
          deps={[{ id: 'requestType' }]}
          default={'{}'}
          rules={[
            async (value) => {
              try {
                jsonParse(value);
                return;
              } catch (error) {
                return 'json不合法';
              }
            },
          ]}
          xComponent={XComponentType.JsonEditor}
          reaction={async (context) => {
            const { updateState, value, depsValues } = context;
            const [requestType] = depsValues.map((item) => item.value);
            updateState({
              ...value,
              visible: requestType === RequestType.POST,
            });
          }}
        ></RdxFormItem>
      </RdxFormItem>

      <RdxFormItem name={'requestProcess'} type={BaseType.Object}>
        <FormLayout labelCol={8}>
          <RdxFormItem
            name={'useParamsTransform'}
            title='默认参数'
            desc='默认参数指的是(pageIndex, pageSize, sort)等参数'
            xComponent={XComponentType.Checkbox}
            type={BaseType.Boolean}
          ></RdxFormItem>
        </FormLayout>
      </RdxFormItem>
      <RdxFormItem name={'resultProcess'} type={BaseType.Object}>
        <FormLayout>
          <RdxFormItem
            name={'useFilter'}
            xComponent={XComponentType.Checkbox}
            title='开启过滤器'
            type={BaseType.Boolean}
          ></RdxFormItem>
          <RdxFormItem
            deps={[{ id: 'useFilter' }]}
            reaction={(context) => {
              const { value, updateState, depsValues } = context;
              const [useFilterInstance] = depsValues;
              updateState({
                ...value,
                visible: !useFilterInstance.value,
              });
            }}
            default={'data'}
            name={'dataField'}
            title='接口数据字段'
            type={BaseType.String}
          ></RdxFormItem>
          <RdxFormItem<IEditorWithInAndOut>
            name={'filter'}
            defaultVisible={false}
            deps={[
              { id: 'useFilter' },
              { id: 'data', type: DepsType.Absolute },
              { id: 'requestInfo.requestType', type: DepsType.Absolute },
              { id: 'requestInfo.url', type: DepsType.Absolute },
              { id: 'requestInfo.body', type: DepsType.Absolute },
            ]}
            reaction={(context) => {
              const { value, updateState, depsValues } = context;
              const [
                useFilterInstance,
                data,
                requestTypeIsntance,
                urlInstance,
                body,
              ] = depsValues.map((item) => item.value);
              try {
                const result = mockResult(
                  data,
                  value,
                  requestTypeIsntance,
                  urlInstance,
                  body
                );
                updateState({
                  ...value,
                  visible: useFilterInstance === true,
                  componentProps: {
                    src: result,
                  },
                });
              } catch (error) {}
            }}
            componentProps={{
              isDialog: true,
              trigger: <Button type='primary'>打开过滤器编辑器</Button>,
            }}
            title='数据过滤器'
            type={BaseType.String}
            xComponent={'code'}
          ></RdxFormItem>
        </FormLayout>
      </RdxFormItem>

      <RdxFormItem
        name='watchResult'
        type={BaseType.String}
        deps={[
          { id: 'resultProcess.useFilter' },
          { id: 'resultProcess.filter', type: DepsType.Absolute },
          { id: 'resultProcess.dataField', type: DepsType.Absolute },
          { id: 'data', type: DepsType.Absolute },
          { id: 'requestInfo.requestType', type: DepsType.Absolute },
          { id: 'requestInfo.url', type: DepsType.Absolute },
          { id: 'requestInfo.body', type: DepsType.Absolute },
        ]}
        reaction={(context) => {
          try {
            const { value, updateState, depsValues } = context;
            let [
              useFilter,
              filter,
              dataField,
              result,
              requestType,
              url,
              body,
            ] = depsValues.map((item) => item.value);
            if (useFilter) {
              result = mockResult(result, filter, requestType, url, body);
            }
            result = parseResult({
              result,
              useFilter,
              filterBody: filter,
              dataField,
            });

            updateState({
              ...value,
              value: JSON.stringify(result),
            });
          } catch (error) {}
        }}
        xComponent={XComponentType.Json}
        title='结果预览'
      ></RdxFormItem>

      {/* </FormLayout> */}
      {/* <DevVisualTableTool /> */}
      {/* <DevVisualGraphTool /> */}
    </RdxFormContext>
  );
}
