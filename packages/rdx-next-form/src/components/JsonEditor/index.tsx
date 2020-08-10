import React from 'react';
import AceEditor from '../AceEditor';
import { Icon } from '@alifd/next';
const MyIcons = Icon.createFromIconfontCN({
  scriptUrl: '//at.alicdn.com/t/font_1944124_h80quc5kqea.js',
});
export default (props) => {
  const { value, onChange } = props;
  return (
    <div style={{ display: 'flex' }}>
      <AceEditor {...props} />
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          width: 30,
          background: '#EBEBEB',
          alignItems: 'center',
        }}
      >
        <MyIcons
          title={'格式化'}
          onClick={() => {
            onChange(JSON.stringify(JSON.parse(value), null, 2));
          }}
          style={{ fontSize: 16 }}
          type='icondaima'
        />
      </div>
    </div>
  );
};
