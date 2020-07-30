import React from 'react';
import Selector, { ChooseValueType, LinkedDataType } from './selector'
export const sample = () => {
  return <Selector fields={[]} chooseType={ChooseValueType.Value} hasDataSource={true} measures={[]} linkedDataType={LinkedDataType.DimensionMember} />
};

export default {
  title: '基本示例|默认值配置',
  parameters: {
    info: { inline: true },
  },
};
