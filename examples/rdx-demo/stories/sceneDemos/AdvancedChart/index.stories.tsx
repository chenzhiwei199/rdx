import * as React from 'react';
import {
  getDimensions,
  getMeasures,
  getData,
  AggregateType,
  Filter,
  Operator,
} from '@czwcode/mock-core';
import uuid from 'uuid';
import {
  watcher,
  useRdxStateLoader,
  Status,
  RdxContext,
  useRdxAtom,
  useRdxWatcher,
  useRdxWatcherLoader,
  useRdxValue,
} from '@czwcode/rdx';
import { Chart, IChartEventHandlerValueType, ActiveStyle } from './chart';
import BaseDataDesigner, { isMeasureField } from './dndFrame/BaseDataDesigner';
import JsonView from 'react-json-view';
import {
  DomainName,
  DomainType,
  Field,
  MeasureField,
  BaseAnalysisOperater,
  AnalysisOperate,
} from './types';
import DragFrame from './dndFrame/DragFrame';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Grid, Button, Dropdown } from '@alifd/next';
import '@alifd/next/dist/next.css';
import { DefineId } from '../constant';

const { Row, Col } = Grid;
export default {
  title: '场景专题/交互式图表',
  parameters: {
    info: { inline: true },
  },
};

interface ClassficationField {
  dimensions: Field[];
  measures: MeasureField[];
  drillDowns: Field[];
}
const ChartDemo = () => {
  const [selected, setSelected] = useRdxAtom({
    id: DefineId.ChartState,
    defaultValue: [] as string[],
  });
  const [filter, setFilter] = useRdxAtom({
    id: DefineId.ChartFilter,
    defaultValue: [] as BaseAnalysisOperater[],
  });

  const [fields] = useRdxWatcher<ClassficationField>({
    id: DefineId.ClassfieldFields,
    get: ({ get }) => {
      const fields = get<Field[]>(DefineId.Fields);
      return {
        dimensions: fields.filter(
          (field) =>
            field.domainName !== DomainName.DrillDown &&
            field.domainType === DomainType.Dimension
        ),
        measures: fields.filter((field) => isMeasureField(field)),
        drillDowns: fields.filter(
          (field) => field.domainName === DomainName.DrillDown
        ),
      };
    },
  });

  const [status, data, setData] = useRdxWatcherLoader({
    id: DefineId.FetchData,
    get: async ({ get }) => {
      const classfieldFields = get<ClassficationField>(
        DefineId.ClassfieldFields
      );
      const { dimensions = [], measures = [] } = classfieldFields;
      const res = await getData({
        dimensions: dimensions.map((item) => item.code),
        measures: measures.map((item) => ({
          key: item.code,
          aggregateType: item.aggregationType,
        })),
        filters: get<BaseAnalysisOperater[]>(DefineId.ChartFilter).reduce(
          (arr, item) => {
            let fields: string[] = item.field as string[];
            let data: string[][] = item.data as string[][];
            if (!item.multipleField) {
              fields = [item.field as string];
              data = [item.data as string[]];
            }
            return arr.concat(
              fields.map((field, index) => {
                return {
                  member: field,
                  operator:
                    item.operate === AnalysisOperate.Include
                      ? Operator.contains
                      : Operator.notContains,
                  values: data[index],
                };
              })
            );
          },
          [] as Filter[]
        ),
      });
      return res.data;
    },
  });

  function onFilterOperate(operate: AnalysisOperate, field: string) {
    // 设置筛选
    setFilter(
      filter.concat([
        {
          timestamp: new Date().getTime(),
          operate: operate,
          sourceUniqueId: uuid(),
          operateUniqueId: uuid(),
          data: selected,
          field: field,
        } as BaseAnalysisOperater,
      ])
    );

    // 清楚选中
    setSelected([]);
  }
  if (
    status === Status.FirstRender ||
    status === Status.Running ||
    status === Status.Waiting
  ) {
    return <div>loading...</div>;
  }
  if (status === Status.Error) {
    return <div>错误啦</div>;
  }
  if (fields.dimensions.length === 0 || fields.measures.length === 0) {
    return <div>维度和度量不能为空</div>;
  }
  const categorySeries = data.map((item) => item[fields.dimensions[0].code]);
  const selectedIndex = selected.map((item) => categorySeries.indexOf(item));
  return (
    <div style={{ border: '1px dashed lightgrey' }}>
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          type='primary'
          onClick={() =>
            onFilterOperate(AnalysisOperate.Include, fields.dimensions[0].code)
          }
        >
          保留
        </Button>
        <Button
          onClick={() =>
            onFilterOperate(AnalysisOperate.Exclude, fields.dimensions[0].code)
          }
        >
          排除
        </Button>
        <Dropdown trigger={<Button>下钻</Button>}>
          <div>
            {fields.drillDowns.map((item) => (
              <div
                onClick={() => {
                  onFilterOperate(AnalysisOperate.DrillDown, item.code);
                }}
                style={{
                  background: 'white',
                  borderRadius: 4,
                  padding: '12px 2px',
                  border: '1px solid lightgrey',
                }}
              >
                {item.label}
              </div>
            ))}
          </div>
        </Dropdown>
      </div>
      <Chart
        onChange={(v) => {
          if (v.type === IChartEventHandlerValueType.Click) {
            const clickItem = v[IChartEventHandlerValueType.Click].x;
            const isSelected = selected.includes(clickItem);
            if (isSelected) {
              setSelected(selected.filter((item) => item !== clickItem));
            } else {
              setSelected(selected.concat([clickItem]));
            }
          }
        }}
        options={{
          grid: {
            containLabel: true,
          },
          tooltip: {
            trigger: 'axis',
            axisPointer: {
              // 坐标轴指示器，坐标轴触发有效
              type: 'shadow', // 默认为直线，可选为：'line' | 'shadow'
            },
          },
          xAxis: {
            type: 'category',
            data: categorySeries,
          },
          yAxis: {
            type: 'value',
          },
          series: [
            {
              data: data.map((item, index) => {
                return {
                  value: item[fields.measures[0].code],
                  itemStyle: selectedIndex.includes(index) ? ActiveStyle : {},
                };
              }),
              type: 'bar',
            },
          ],
        }}
      />
      <JsonView src={data}></JsonView>
    </div>
  );
};
const DragItem = (props: { code: string; domainType: DomainType }) => {
  const { code, domainType } = props;
  return (
    <DragFrame
      dataConfig={{
        domainType: domainType,
        label: code,
        code: code,
      }}
    >
      <div
        style={{
          width: 160,
          background: 'rgb(230, 233, 237)',
          borderRadius: 4,
          padding: 6,
          marginTop: 12,
        }}
      >
        {code}
      </div>
    </DragFrame>
  );
};
const MetaList = () => {
  const [dimensionStatus, dimensions] = useRdxWatcherLoader({
    id: DefineId.DimensionMeta,
    get: async () => {
      return (await getDimensions()).data;
    },
  });
  const [measureStatus, measures] = useRdxWatcherLoader({
    id: DefineId.MeasureMeta,
    get: async () => {
      return (await getMeasures()).data;
    },
  });
  if (measureStatus !== Status.IDeal || dimensionStatus !== Status.IDeal) {
    return <div>loading...</div>;
  }
  return (
    <div style={{ display: 'flex', justifyContent: 'space-around' }}>
      <section>
        <strong>维度</strong>
        {dimensions.map((item, index) => (
          <DragItem code={item} domainType={DomainType.Dimension} />
        ))}
      </section>
      <section>
        <strong>指标</strong>
        {measures.map((item, index) => (
          <DragItem code={item} domainType={DomainType.Measure} />
        ))}
      </section>
    </div>
  );
};
const DataDesigner = BaseDataDesigner(
  [
    {
      domainName: DomainName.X,
      domainType: DomainType.Dimension,
      label: '分类',
    },
    {
      domainName: DomainName.Y,
      domainType: DomainType.Measure,
      label: '数值',
    },
    {
      domainName: DomainName.Color,
      domainType: DomainType.Dimension,
      label: '颜色',
    },
    {
      domainName: DomainName.DrillDown,
      domainType: DomainType.Dimension,
      label: '下钻维度',
    },
  ],
  { tips: 'hahaha' }
);
const DropContainer = () => {
  // { aggregateType: AggregateType.Sum, key: '利润' } { key: '单据日期' }
  const [fields, setFields] = useRdxAtom({
    id: DefineId.Fields,
    defaultValue: [
      {
        label: '单据日期',
        code: '单据日期',
        domainName: DomainName.X,
        domainType: DomainType.Dimension,
      },
      {
        label: '地区名称',
        code: '地区名称',
        domainName: DomainName.DrillDown,
        domainType: DomainType.Dimension,
      },
      {
        label: '利润',
        code: '利润',
        domainName: DomainName.Y,
        aggregationType: AggregateType.Sum,
        domainType: DomainType.Measure,
      } as MeasureField,
    ] as Field[],
  });
  return <DataDesigner dataSource={fields} onChange={setFields} />;
};
const DataView = () => {
  return <div>

  </div>
}
export const 交互式柱状图 = () => {
  return (
    <RdxContext>
      <div>
        <h3>规则： </h3>
        1. 能使用一个图尽量使用一个图
        <br />
        2. 图放不下时，选择分面
        <br />
        <h3>
          比如柱状图，展示的时候，颜色和x轴代表了两个不同的维度，所以数值上会存在三种选中情况
        </h3>
        1. x轴映射维度的选择
        <br />
        2. color映射的选择
        <br />
        3. 指标的选择
      </div>
      <DndProvider backend={HTML5Backend}>
        <Row>
          <Col span={6}>
            <MetaList />
          </Col>
          <Col span={4}>
            <DropContainer />
          </Col>
          <Col offset={1} span={9}>
            <ChartDemo />
          </Col>
        </Row>
      </DndProvider>
    </RdxContext>
  );
};
