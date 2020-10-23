import React, { FC } from 'react';
import { RequestType, REQUEST_TYPE, IHttpSettingValue } from './types';
import {
  RdxFormContext,
  RdxFormItem as UnDefinedRdxFormItem,
  FormLayout,
  XComponentType,
  BaseType,
  IRdxFormItem,
  IRdxFormComputeGet,
  useRdxFormGlboalState,
  useRdxFormAtomLoader,
  FormRdxStateContext,
  useRdxFormState,
} from '@czwcode/rdx-next-form';
import { RdxContext } from '@czwcode/rdx';
import { Button, Notification } from '@alifd/next';
import { parseGetParams, mockResult, jsonParse } from './utils';
import { fetchData } from './dataUtils';
import JsonView from 'react-json-view';

const RdxFormItem = <GBaseType extends BaseType>(
  props: IRdxFormItem<HttpSettingState & { data: unknown }, GBaseType>
) => {
  return <UnDefinedRdxFormItem {...props} />;
};

export interface IHttpSetting {
  value: IHttpSettingValue;
  onChange?: (value: IHttpSettingValue) => void;
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
function Preview() {
  const [v] = useRdxFormState<any>('data');
  return (
    <JsonView
      src={v.value || { message: '请点击查询按钮获取数据结果' }}
    ></JsonView>
  );
}
function FetchComponent() {
  const globalState = useRdxFormGlboalState();
  const [state, setState] = useRdxFormAtomLoader({
    id: 'data',
    virtual: true,
    defaultValue: { value: null, visible: true, disabled: false },
  });
  return (
    <Button
      onClick={() => {
        async function getData() {
          const res = await fetchData({
            defaultOptions: globalState.state,
            isFormatter: false,
          });
          setState({
            value: res,
            visible: true,
            disabled: false,
          });
        }
        getData();
      }}
    >
      查询数据
    </Button>
  );
}

const InfoWrapper = ({ title = '标题', children }) => {
  return (
    <div
      style={{
        marginBottom: 12,
        border: '1px dashed lightgrey',
        position: 'relative',
        width: '100%',
        height: '100%',
        padding: 12,
      }}
    >
      <div
        style={{
          position: 'absolute',
          background: 'white',
          left: 20,
          top: -10,
          padding: 4,
        }}
      >
        {title}
      </div>
      {children}
    </div>
  );
};
const RequestInfo = () => {
  const compute = ({ get, set, id }, newValue) => {
    const ids = id.split('.');
    const currentIndex = ids[ids.length - 2];
    const currentKey = ids[ids.length - 1];
    const urlInstance = get('requestInfo.url');
    const newUrl = updateUrl(
      urlInstance.value,
      currentKey,
      currentIndex,
      newValue.value
    );
    set('requestInfo.url', {
      ...urlInstance,
      value: newUrl,
    });
  };
  const get: IRdxFormComputeGet<any, HttpSettingState & { data: unknown }> = ({
    id,
    get,
  }) => {
    const ids = id.split('.');
    const currentIndex = ids[ids.length - 2];
    const currentKey = ids[ids.length - 1];
    // @ts-ignore
    const value = parseGetParams(get('requestInfo.url').value);
    return {
      value: value[currentIndex][currentKey],
      visible: true,
      disabled: false,
    };
  };
  return (
    <InfoWrapper title='请求信息'>
      <RdxFormItem name='requestInfo' type={BaseType.Object}>
        <div style={{ display: 'flex' }}>
          <RdxFormItem
            name='requestType'
            type={BaseType.String}
            componentProps={{
              dataSource: REQUEST_TYPE.map((item) => ({
                label: item,
                value: item,
              })),
            }}
            default={REQUEST_TYPE[0]}
            xComponent={XComponentType.Select}
          ></RdxFormItem>
          <RdxFormItem
            name='url'
            type={BaseType.String}
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
          />
          <FetchComponent />
        </div>

        <RdxFormItem
          name='params'
          title='参数配置'
          virtual={true}
          xComponent={XComponentType.ArrayTable}
          type={BaseType.Array}
          get={({ get, value }) => {
            const url = get('requestInfo.url').value;
            try {
              new URL(url);
              return {
                ...value,
                visible: true,
                value: parseGetParams(url),
              };
            } catch (error) {
              return {
                ...value,
                visible: false,
              };
            }
          }}
          set={({ id, get, set }, newValue) => {
            const urlObj = get('requestInfo.url');
            try {
              // @ts-ignore
              set('requestInfo.url', {
                ...urlObj,
                value: createNewUrl(urlObj.value, newValue.value),
              });
            } catch (error) {
              Notification.help({
                content: JSON.stringify(error.toString()),
              });
            }
          }}
        >
          <RdxFormItem
            type={BaseType.Object}
            default={{ key: '1', value: '2' }}
          >
            <RdxFormItem
              get={get}
              set={compute}
              title='key'
              name='key'
              type={BaseType.String}
            ></RdxFormItem>
            <RdxFormItem
              set={compute}
              get={get}
              title='value'
              name='value'
              type={BaseType.String}
            ></RdxFormItem>
          </RdxFormItem>
        </RdxFormItem>
        <RdxFormItem
          name='body'
          defaultVisible={false}
          type={BaseType.String}
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
          get={async ({ value, get }) => {
            const requestType = get('requestInfo.requestType').value;
            return {
              ...value,
              visible: requestType === RequestType.POST,
            };
          }}
        ></RdxFormItem>
      </RdxFormItem>
    </InfoWrapper>
  );
};

export default function HttpSetting(props: IHttpSetting) {
  const { value, onChange } = props;

  return (
    <RdxContext>
      <div>
        <h4>问题总结： </h4>
        <div>1. 数据的类型推断非常的不友好，怎样可以让类型推断友好一些</div>
        <div>
          解法. 本来就是表单工具，可以通过type的类型，来进行get返回数据的推论
        </div>
        <div>2. 通过get方式返回数据的方式还需要考虑原来的状态，不太好用</div>
        <div>解法. 和第三点合并，一起解</div>
        <div>3. get里面获取当前节点自己原来的数据是一件比较麻烦的事情</div>
        <div>解法. 将原来的数据传递下来</div>
        <div>
          4. 整体表单的数据获取get使用的太多了，获取一个组件依赖的数据太麻烦了
        </div>
        <div>解法. 不需要解</div>
        <div>5. 获取表单的数据，需要绝对路径，比较冗长。</div>
        <div>解法. 不需要解</div>
        <div>6. 通过代码，生成ts定义</div>
      </div>
      <RdxFormContext
        state={value}
        onChange={onChange}
        typescriptGenerateOptions={{ rootName: 'HttpSettingState' }}
        enabledStatePreview={true}
        enabledTypescriptGenerte={true}
      >
        <RequestInfo></RequestInfo>
        <InfoWrapper title='请求参数处理'>
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
        </InfoWrapper>
        <InfoWrapper title='返回结果处理'>
          <RdxFormItem name={'resultProcess'} type={BaseType.Object}>
            <FormLayout>
              <RdxFormItem
                name={'useFilter'}
                xComponent={XComponentType.Checkbox}
                title='开启过滤器'
                default={false}
                type={BaseType.Boolean}
              ></RdxFormItem>
              <RdxFormItem
                get={({ get }) => {
                  const useFilterInstance = get('resultProcess.useFilter');
                  return {
                    ...value,
                    visible: !useFilterInstance.value,
                  };
                }}
                default={'data'}
                name={'dataField'}
                title='接口数据字段'
                type={BaseType.String}
              ></RdxFormItem>
              <RdxFormItem
                name={'filter'}
                defaultVisible={false}
                get={({ get, value }) => {
                  const data = get('data').value;
                  const useFilter = get('resultProcess.useFilter').value;
                  const requestType = get('requestInfo.requestType');
                  const urlInstance = get('requestInfo.url');
                  const body = get('requestInfo.body');

                  const baseValue = {
                    ...value,
                    visible: useFilter === true,
                  };
                  try {
                    const result = mockResult(
                      data,
                      value.value,
                      requestType as any,
                      urlInstance.value,
                      body.value
                    );
                    return {
                      ...baseValue,
                      componentProps: {
                        ...value.componentProps,
                        src: result,
                      },
                    };
                  } catch (error) {
                    return baseValue;
                  }
                }}
                componentProps={{
                  isDialog: true,
                  // trigger: <Button type='primary'>打开过滤器编辑器</Button>,
                }}
                title='数据过滤器'
                type={'string'}
                xComponent={'code'}
              ></RdxFormItem>
            </FormLayout>
          </RdxFormItem>
        </InfoWrapper>
        <InfoWrapper title='数据预览'>
          <Preview />
        </InfoWrapper>
      </RdxFormContext>
    </RdxContext>
  );
}

interface HttpSettingState {
  requestInfo: RequestInfo;
  requestProcess: RequestProcess;
  resultProcess: ResultProcess;
}
interface ResultProcess {
  useFilter: boolean;
  dataField: string;
  filter: string;
}
interface RequestProcess {
  useParamsTransform: boolean;
}
interface RequestInfo {
  requestType: string;
  url: string;
  body: string;
}
