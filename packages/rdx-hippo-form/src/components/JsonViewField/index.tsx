import React from 'react';
import ReactJsonView from 'react-json-view';
import { Loading } from '@alifd/next';
export default function JsonView(props: { value: string; loading?: boolean }) {
  const { value = '{}', loading } = props;
  const reactJsonStyle = {
    marginTop: 12,
    borderRadius: 5,
    padding: '6px',
    height: 200,
    overflow: 'auto',
  };
  return (
    <Loading style={{ width: '100%' }} visible={loading === true}>
      <ReactJsonView
        style={reactJsonStyle}
        theme='monokai'
        src={JSON.parse(value)}
      />
    </Loading>
  );
}
