import React from 'react';
import { produce } from 'immer';
import { AggregateType } from '@czwcode/mock-core';
import DropFrame from './DropFrame';
import DragFrame from './DragFrame';
import {
  DataConfig,
  DomainType,
  DomainName,
  Field,
  MeasureField,
  DropConfig,
} from '../types';

function checkCanDrop(dataSource: Field[], dataConfig: DataConfig) {
  const { code, domainName } = dataConfig;
  if (!dataSource) {
    return true;
  }
  const isCanDrop = dataSource.every((indicator) => {
    // 来自数据源池的时候，domainName不存在
    if (!domainName) {
      return indicator.code !== code;
    } else {
      return true;
    }
  });
  return isCanDrop;
}

export interface BaseDesignerOptions {
  tips?: string;
}
export function isMeasureField(item: Field) {
  return (
    item &&
    ((item.domainType === DomainType.All &&
      item.originDomainType === DomainType.Measure) ||
      item.domainType === DomainType.Measure)
  );
}

export function getDomainValue(
  code: string,
  label: string,
  domainName: DomainName,
  domainType: DomainType,
  originDomainType: DomainType
) {
  const field = { originDomainType, domainName, domainType, code, label };
  // 表格的一个视觉通道，映射了多种数据类型
  const newDomainType =
    domainType === DomainType.All ? originDomainType : domainType;
  if (isMeasureField({ ...field, domainType: newDomainType } as Field)) {
    return {
      code,
      label,
      domainName,
      domainType: newDomainType,
      originDomainType: originDomainType,
      aggregationType: AggregateType.Sum,
    } as MeasureField;
  } else {
    return {
      code,
      label,
      domainName,
      domainType: newDomainType,
      originDomainType: originDomainType,
    } as Field;
  }
}

export interface DataSourceDesignerInterface {
  dataSource: Field[];
  DragItemFrame?: (props: Field, domainName: string) => React.ReactNode;
  onChange: (dataSource: Field[]) => void;
}

const BaseDataDesigner = (
  drops: DropConfig[],
  options?: BaseDesignerOptions
) => (props: DataSourceDesignerInterface) => {
  /*
  1. 支持针对domainName的定义
  2. 支持canDrop校验
  3. 支持数量限制
  4. 支持文案提示定制
  5. 支持位置交换
  */
  const {
    dataSource,
    onChange,
    DragItemFrame = (field) => {
      return <div>{field.label}</div>;
    },
  } = props;
  const { tips } = (options || {}) as BaseDesignerOptions;
  return (
    <div style={{ width: '100%', overflowX: 'hidden' }}>
      <div
        style={{
          boxShadow: '0 0 8px 0 rgba(153, 163, 179, 0.28)',
          padding: 12,
          borderRadius: 4,
          background: 'lightyellow',
          opacity: 0.8,
          color: 'rgb(134,134,130)',
        }}
      >
        tips: {tips}
      </div>
      {drops.map((dropInfo, index) => {
        return (
          <div key={dropInfo.domainName} style={{ marginTop: 12 }}>
            <strong>{dropInfo.label}</strong>
            <DropFrame
              style={{
                boxShadow: '0 0 8px 0 rgba(153, 163, 179, 0.28)',
                marginTop: 4,
                border: '1px dashed #bfbfbf',
                padding: 6,
                background: '#edf1f5',
                borderRadius: 4,
              }}
              canDropFunction={(dataConfig: DataConfig) => {
                const currentFields = dataSource.filter(
                  (item) => item.domainName === dropInfo.domainName
                );
                // 如果来源就是这个容器的，可以进行拖拽排序
                if (dataConfig.domainName === dropInfo.domainName) {
                  return true;
                }
                // 如果超过数量，怎么不可以拖拽
                if (currentFields.length === dropInfo.limit) {
                  return false;
                }
                // 不同数据类型的数据不能互相拖拽
                if (
                  dataConfig.domainType !== dropInfo.domainType &&
                  dropInfo.domainType !== DomainType.All
                ) {
                  return false;
                }
                // 不是这个容器，可能来源于数据源池，或者其他的通道
                return checkCanDrop(currentFields, dataConfig);
              }}
              tipsRender={(dataConfig: DataConfig) => {
                const currentFields = dataSource.filter(
                  (item) => item.domainName === dropInfo.domainName
                );
                if (dataConfig.domainName === dropInfo.domainName) {
                  return true;
                }
                if (currentFields.length === dropInfo.limit) {
                  return `${dropInfo.label} 超过数量限制`;
                }
                if (!checkCanDrop(currentFields, dataConfig)) {
                  return `${dataConfig.label} 已存在 `;
                }
                // 不同数据类型的数据不能互相拖拽
                if (
                  dataConfig.domainType !== dropInfo.domainType &&
                  dropInfo.domainType !== DomainType.All
                ) {
                  return (
                    '不能拖入' +
                    (dataConfig.domainType === DomainType.Dimension
                      ? '维度'
                      : '指标') +
                    '字段'
                  );
                }
                return '';
              }}
              onDrop={(dataConfig: DataConfig) => {
                if (dataConfig.domainName !== dropInfo.domainName) {
                  //  获取默认值
                  const newField = getDomainValue(
                    dataConfig.code,
                    dataConfig.label,
                    dropInfo.domainName,
                    dropInfo.domainType,
                    dataConfig.domainType
                  );
                  const findIndex = dataSource.findIndex(
                    (item) =>
                      item.domainName === dataConfig.domainName &&
                      item.code === dataConfig.code
                  );
                  onChange(
                    produce(props.dataSource, (dataSource: Field[]) => {
                      if (findIndex !== -1) {
                        dataSource.splice(findIndex, 1);
                      }

                      dataSource.push(newField);
                    })
                  );
                }
              }}
            >
              <div style={{ minHeight: 70 }}>
                {(((dataSource && dataSource) || []) as Field[])
                  .map((item, index) => ({ ...item, index }))
                  .filter((item) => item.domainName === dropInfo.domainName)
                  .map((field: Field & { index: number }) => {
                    return (
                      <DragFrame
                        key={field.code}
                        canDrop={true}
                        index={field.index}
                        onDragEnd={(dataConfig) => {
                          onChange(
                            produce(dataSource, (dataSource: Field[]) => {
                              const findIndex = dataSource.findIndex(
                                (item) =>
                                  item.code === dataConfig.code &&
                                  item.domainName === dataConfig.domainName
                              );
                              if (findIndex !== -1) {
                                dataSource.splice(findIndex, 1);
                              }
                            })
                          );
                        }}
                        move={(preIndex, currentIndex) => {
                          onChange(
                            produce(dataSource, (dataSource: Field[]) => {
                              const field = dataSource;
                              const preItem = field.splice(
                                preIndex,
                                1,
                                field[currentIndex]
                              )[0];
                              field.splice(currentIndex, 1, preItem);
                            })
                          );
                        }}
                        dataConfig={{
                          code: field.code,
                          label: field.label,
                          domainName: dropInfo.domainName,
                          domainType: field.domainType as any,
                        }}
                      >
                        <Item>{DragItemFrame(field, dropInfo.domainName)}</Item>
                      </DragFrame>
                    );
                  })}
              </div>
            </DropFrame>
          </div>
        );
      })}
    </div>
  );
};

function Item({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        padding: 6,
        marginTop: 6,
        borderRadius: 3,
        background: '#b7dcf7',
      }}
    >
      {children}
    </div>
  );
}
export default BaseDataDesigner;
