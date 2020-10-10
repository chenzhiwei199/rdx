import React from 'react';
import { toArr, normalizeCol, useRdxFormReset } from '@czwcode/rdx-form';
import { Button, Grid } from '@alifd/next';
const { Row, Col } = Grid;
export interface ISearchList extends ISearchAction {
  cols: ({ span: number; offset: number } | number)[];
  rowNums?: number;
  footer?: React.ReactNode;
  children: React.ReactNode | React.ReactNode[];
}

export interface ISearchAction {
  onSearch?: (value: any) => void;
  onReset?: () => void;
}
export function SearchListLayout(props: ISearchList) {
  let { cols = [], children, rowNums = 3, onSearch, onReset } = props;
  const normalizerCols = toArr(cols).map((item) => normalizeCol(item));
  const childrens = toArr(children);
  const childNum = childrens.length;
  const grids: React.ReactNode[] = [];
  for (let index = 0; index < childNum; index += rowNums) {
    grids.push(
      <Row>
        {childrens.slice(index, index + rowNums).map((child, key) => {
          return (
            <Col key={key} {...normalizerCols[key % normalizerCols.length]}>
              {child}
            </Col>
          );
        })}
      </Row>
    );
  }
  return (
    <div style={{ background: 'white', padding: '16px 16px 0 16px' }}>
      <div>{grids}</div>
      <div style={{ borderTop: '1px solid lightgrey' }}></div>
      <div
        style={{
          padding: '12px',
        }}
      >
        <SearchListFooter onSearch={onSearch} onReset={onReset} />
      </div>
    </div>
  );
}

const SearchListFooter = (props: {
  onSearch?: (value: any) => void;
  onReset?: () => void;
}) => {
  const reset = useRdxFormReset();
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        width: '100%',
        alignItems: 'center',
      }}
    >
      <span>
        <Button type='primary'>确定</Button>
        <Button
          style={{ marginLeft: '20px' }}
          onClick={() => {
            reset();
          }}
        >
          重置
        </Button>
      </span>
    </div>
  );
};
