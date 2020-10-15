import React from 'react';
import {
  toArr,
  normalizeCol,
  useRdxFormReset,
  useRdxFormLoading,
  RdxFormContext,
} from '@czwcode/rdx-form';
import { Button, Grid } from '@alifd/next';
const { Row, Col } = Grid;
export interface ISearchListLayout extends ISearchAction {
  cols: ({ span: number; offset: number } | number)[];
  rowNums?: number;
  footer?: React.ReactNode;
  children?: React.ReactNode;
}

export interface ISearchAction {
  onSearch?: (value: any) => void;
  onReset?: () => void;
}

export interface ISearchList extends ISearchListLayout {
  children?: React.ReactNode;
  firstTrigger?: boolean;
}
export function SearchList(props: ISearchList) {
  // TODO: onSearch 只应该在没有错误的时候才应该调用
  const { children, firstTrigger = true, onSearch } = props;
  const first = React.useRef(firstTrigger);
  const valueRef = React.useRef(null);
  return (
    <RdxFormContext
      onChange={(value) => {
        valueRef.current = value;
        if (first.current) {
          onSearch(value);
          first.current = false;
        }
      }}
    >
      <SearchListLayout
        cols={[8]}
        onSearch={(value) => {
          onSearch(valueRef.current);
        }}
      >
        {children}
      </SearchListLayout>
    </RdxFormContext>
  );
}
export function SearchListLayout(props: ISearchListLayout) {
  let { cols = [], children, rowNums = 3, onSearch, onReset } = props;
  const normalizerCols = toArr(cols).map((item) => normalizeCol(item));
  const childrens = toArr(children);
  const childNum = childrens.length;
  const grids: React.ReactNode[] = [];
  for (let index = 0; index < childNum; index += rowNums) {
    grids.push(
      <Row key={index}>
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
  const { onSearch, onReset } = props;
  const reset = useRdxFormReset();
  const isLoading = useRdxFormLoading();
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
        <Button
          onClick={() => {
            onSearch && onSearch(1);
          }}
          disabled={isLoading()}
          type='primary'
        >
          确定
        </Button>
        <Button
          disabled={isLoading()}
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
