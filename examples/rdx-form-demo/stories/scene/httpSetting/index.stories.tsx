import React from 'react';
import { setup } from '@czwcode/rdx-next-form';
import HttpSetting from './httpSettings';
import { useState } from 'react';
import { IHttpSettingValue } from './types';
setup();
export default {
  title: '场景案例/http配置器',
  parameters: {
    info: { inline: true },
  },
};

export const http配置器 = () => {
  const [value, setValue] = useState<IHttpSettingValue>({
    requestInfo: {
      requestType: 'GET',
      url: '',
    },
  } as any);
  return (
    <div style={{ width: 600 }}>
      <HttpSetting value={value} />
    </div>
  );
};

