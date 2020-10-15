import TriggerButton from './TriggerButton';
import React, { useState, createContext } from 'react';
import TableViewer from './TableViewer';
import { ShareContextClass } from '@czwcode/rdx';
import {
  DataPersistenceHook,
  IDataPersistenData,
} from '@czwcode/rdx-plugin-base';
import { Button } from '@alifd/next';

export const DataPersistence = createContext<IDataPersistenData>(null);
enum Direction {
  Right = 'right',
  Bottom = 'bottom',
}
const directionStyles = {
  [Direction.Right]: {
    width: '600px',
    height: '100%',
    top: 0,
    right: 0,
  },
  [Direction.Bottom]: {
    width: '100%',
    height: '600px',
    bottom:  0,
    left: 0,
  }
};
export const DevVisualTableTool = (props: { context?: React.Context<ShareContextClass> }) => {
  const [visible, setVisible] = useState(false);
  const [direction, setDirection] = useState(Direction.Right);

  const state = DataPersistenceHook(props.context);
  return (
    <div>
      <TriggerButton
        onClick={() => {
          setVisible(!visible);
        }}
      ></TriggerButton>
      <DataPersistence.Provider value={state}>
        {visible && (
          <div
            style={{
              zIndex: 999,
              position: 'fixed',
              background: 'white',
              ...directionStyles[direction],
              overflow: 'auto',
            }}
          >
            <div>
              {/* // @ts-ignore */}
              <Button
                onClick={() => {
                  setDirection(Direction.Right);
                }}
              >
                右
              </Button>
              <Button
                onClick={() => {
                  setDirection(Direction.Bottom);
                }}
              >
                下
              </Button>
              <Button onClick={() => state.clear()}>
                Clear
              </Button>
            </div>
            {<TableViewer />}
          </div>
        )}
      </DataPersistence.Provider>
    </div>
  );
};
