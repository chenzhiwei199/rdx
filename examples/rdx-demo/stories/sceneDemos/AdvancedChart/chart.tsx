import * as React from 'react';
import echart from 'echarts';
import { useRdxCompute, useRdxAtom } from '../../../../../packages/rdx/src';
import { DefineId } from '../constant';
import ReactDOM from 'react-dom';

interface IChartSizeHandle {
  width: number;
  height: number;
}
/**
 *  Echart size Effect
 *
 * @param {React.MutableRefObject<echart.ECharts>} echartInstance
 * @param {{ width, height}} options
 */
function useSizeHook(
  echartInstance: React.MutableRefObject<echart.ECharts>,
  options: IChartSizeHandle
) {
  const { width, height } = options;
  React.useEffect(() => {
    if (echartInstance.current) {
      echartInstance.current.resize({
        width,
        height,
      });
    }
  }, [echartInstance, width, height]);
}

/**
 * 用户操作的时候，应该mergeOptions, 数据更新应该norMerge
 * @param options
 */
function useChartUpdateHook(options: {
  merge: boolean;
  echartOptions: echart.EChartOption;
}): [
  React.MutableRefObject<echart.ECharts>,
  React.MutableRefObject<HTMLDivElement>
] {
  const echartInstance = React.useRef<echart.ECharts>(null);
  const chartRef = React.useRef<HTMLDivElement>(null);
  const { merge, echartOptions } = options;
  React.useEffect(() => {
    // 缓存dataZoom 状态
    if (chartRef.current) {
      if (!echartInstance.current) {
        echartInstance.current = echart.init(chartRef.current, null, {
          width: 'auto',
          height: 'auto',
        });
      }
      echartInstance.current.setOption(echartOptions, {
        notMerge: merge,
        silent: true,
      });
    }
  });

  return [echartInstance, chartRef];
}

export enum IChartEventHandlerValueType {
  Brush = 'brush',
  Click = 'click',
}
export interface IChartEventHandler {
  onChange: (v: IChartEventHandlerValue) => void;
}

export type IChartEventHandlerValue = {
  type: IChartEventHandlerValueType;
  [IChartEventHandlerValueType.Click]?: {
    x: string;
    color?: string;
  };
  [IChartEventHandlerValueType.Brush]?: {
    value: string[];
  };
};
/**
 * 图表事件处理器
 *
 * @param {React.MutableRefObject<echart.ECharts>} echartInstance
 * @param {({ eventField: string; multiple: boolean } & IWidgetEventHandler)} options
 */
export function useClickEventHook(
  echartInstance: React.MutableRefObject<echart.ECharts>,
  options: IChartEventHandler
) {
  const { onChange } = options;
  React.useEffect(() => {
    echartInstance.current.off('click');
    echartInstance.current.on('click', (params) => {
      ReactDOM.unstable_batchedUpdates(() => {
        onChange({
          type: IChartEventHandlerValueType.Click,
          click: {
            color: params.seriesName,
            x: params.name,
          },
        });
      });
    });
  }, [onChange]);
}

export interface IChart {
  merge?: boolean;
  width?: number;
  height?: number;
  onChange?: (v: IChartEventHandlerValue) => void;
  options: echart.EChartOption;
}

export const ActiveStyle = {
  opacity: 1,
  borderColor: '#000',
  borderWidth: 2,
  borderType: 'solid',
};
export function Chart(props: IChart) {
  const { width = 400, height = 400, merge = false, options, onChange } = props;
  const [echartInstance, ref] = useChartUpdateHook({
    merge,
    echartOptions: options,
  });
  useClickEventHook(echartInstance, {
    onChange: onChange,
  });
  useSizeHook(echartInstance, { width, height });
  return <div ref={ref} style={{ width, height }}></div>;
}
