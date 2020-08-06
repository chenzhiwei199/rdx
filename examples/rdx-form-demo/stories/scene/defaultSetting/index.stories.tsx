import React from 'react';
import { DefaultSelector } from './selector';
import { setup } from '@czwcode/rdx-next-form';
setup();
import { ChooseValueType, LinkedDataType } from './types';
export default {
  title: '场景案例/默认值配置',
  parameters: {
    info: { inline: true },
  },
};

export const 选择类型和默认值 = () => {
  return (
    <DefaultSelector
      chooseType={ChooseValueType.Value}
      measures={[]}
      fields={[]}
      linkedDataType={LinkedDataType.DimensionMember}
      hasDataSource={true}
    />
  );
};

export const 仅默认值 = () => {
  return (
    <DefaultSelector
      chooseType={ChooseValueType.OnlyChooseDefaultValue}
      measures={[]}
      fields={[]}
      linkedDataType={LinkedDataType.DimensionMember}
      hasDataSource={false}
    />
  );
};

export const 仅类型 = () => {
  return (
    <DefaultSelector
      chooseType={ChooseValueType.OnlyChooseType}
      measures={[]}
      fields={[]}
      linkedDataType={LinkedDataType.DimensionMember}
      hasDataSource={true}
    />
  );
};

// export const ShowAllMultiSelectSettingRenderer = MultiSelectSettingRenderer({
//   showType: IMultiSelectSettingRendererType.ShowAll,
// })
// export const JustShowDefaultConfigWithoutDataSourceSettingRenderer = MultiSelectSettingRenderer({
//   showType: IMultiSelectSettingRendererType.JustShowDefaultConfig,
//   showDataSourceChoose: false,
// })
// export const JustShowChooseTypeRenderer = MultiSelectSettingRenderer({
//   showType: IMultiSelectSettingRendererType.JustShowChooseType,
// })
