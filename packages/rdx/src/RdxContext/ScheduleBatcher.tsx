import React, { useEffect, useState, useContext } from 'react';
import { ShareContextInstance } from './shareContext';


const ScheduleBatcher = (props: { setNotifyBatcherOfChange: any} ) => {
  const storeRef = useContext(ShareContextInstance)
  const [_, setState] = useState([]);
  props.setNotifyBatcherOfChange(() => setState({} as any));
  useEffect(() => {
    if(storeRef.triggerQueue.size > 0) {
      storeRef.batchTriggerSchedule(Array.from(storeRef.triggerQueue))
    }
    storeRef.triggerQueue.clear()
  })

  return null
}

export default ScheduleBatcher