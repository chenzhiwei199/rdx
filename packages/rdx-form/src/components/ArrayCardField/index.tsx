import React, { useContext } from 'react';
import styled from 'styled-components';
import { RenderPerRow } from '../../utils/render';
import { createArrayMutators } from './utils';
import { FormContextInstance } from '../../hooks';
export * from './utils';

export interface IArray {
  value: any[];
  onChange: (v: any[]) => void;
  name: string;
  children: React.ReactNode;
}

export interface IArrayItem {
  value: any;
  paths: string[];
  children: React.ReactNode;
}

const Array = (props: IArray) => {
  const { value = [], onChange, children } = props;
  const { name } = useContext(FormContextInstance);
  console.log('ArrayCardField: ', name, value);
  const { remove, moveDown, moveUp, add } = createArrayMutators(
    onChange,
    children
  );
  return (
    <StyleCard>
      {/* {value.length === 0 && (
        <StyleEmpty>
          <img
            src='//img.alicdn.com/tfs/TB1cVncKAzoK1RjSZFlXXai4VXa-184-152.svg'
            style={{ background: 'transparent' }}
          ></img>
        </StyleEmpty>
      )} */}
      {value.map((item, index) => {
        return <RenderPerRow key={index} children={children} rowIndex={index} />;
      })}
      <StyledAdd
        onClick={() => {
          add();
        }}
      >
        添加一个数组
      </StyledAdd>
    </StyleCard>
  );
};

const StyleEmpty = styled.div`
  display: flex;
  flex-direction: center;
  align-items: center;
  justify-content: center;
`;
const StyleCard = styled.div`
  box-shadow: none;
  border-width: 1px;
  border-style: solid;
  padding: 12px;
  border-color: rgb(238, 238, 238);
  border-image: initial;
`;
const StyledItemHeader = styled.div`
  position: relative;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #e6e7eb;
  margin-top: 8px;
  margin-bottom: 0;
  height: 40px;
  line-height: 40px;
`;
const StyledAdd = styled.div`
  margin-top: 20px;
  margin-bottom: 3px;
  display: flex;
  cursor: pointer;
  -webkit-box-pack: center;
  justify-content: center;
  box-shadow: rgba(0, 0, 0, 0.1) 1px 1px 4px 0px;
  background: rgb(255, 255, 255);
  padding: 10px 0px;
`;
export default Array;
