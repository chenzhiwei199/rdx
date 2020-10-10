
import renderer from 'react-test-renderer';
import {render} from '@testing-library/react';
import { RdxContext } from '../../RdxContext';
import React from 'react';
import { useRdxAtom } from '../../hooks/stateHooks';

test('当Rdx外部初始化了数据，不应该被默认值设置覆盖', () => {
  const Test = () => {
    const [atom] = useRdxAtom({
      id: 'test',
      defaultValue: 'default'
    })
    return <div>{atom}</div>
  }
  const { getByText } = render(
    <RdxContext initializeState={{ 'test': 'init'}}>
      <Test></Test>
    </RdxContext>
  );
  expect(getByText('init')).toBeTruthy();
});