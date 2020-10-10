import React, { useEffect } from 'react';
import logger from '../utils/log';
import { useRdxStateContext, ShareContextClass } from '..';

const Batcher = (props: { setNotifyBatcherOfChange: any, context: React.Context<ShareContextClass> }) => {
  const [state, dispatch] = React.useReducer((s) => ({}), {});
  const storeRef = useRdxStateContext(props.context);
  props.setNotifyBatcherOfChange(() => dispatch());
  useEffect(() => {
    if (storeRef.getUiQueue().size > 0) {
      logger.info('UI Batcher', Array.from(storeRef.getUiQueue()));
      Array.from(storeRef.getUiQueue()).forEach((id) => {
        storeRef.getEventEmitter().emit(id);
      });
      storeRef.getUiQueue().clear();
    }
  });
  return null;
};

export default Batcher;
