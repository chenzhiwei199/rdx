import React, { useEffect, useState, useContext } from 'react';
import { ShareContextInstance, ShareContextClass } from './shareContext';
import { StateUpdateType } from '../global';
import logger from '../utils/log';

const Batcher = (props: { setNotifyBatcherOfChange: any }) => {
  const [state, dispatch] = React.useReducer(s => ({}) , {} );
  const storeRef = useContext<ShareContextClass<any, any>>(ShareContextInstance)
  props.setNotifyBatcherOfChange(() => dispatch());
  useEffect(() => {
    if (storeRef.uiQueue.size > 0) {
      logger.info("UI Batcher", Array.from(storeRef.uiQueue))
      Array.from(storeRef.uiQueue).forEach((id) => {
        storeRef.eventEmitter.emit(id);
      });
      storeRef.uiQueue.clear();
    }
    
  });
  return null;
};

export default Batcher;
