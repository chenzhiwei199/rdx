// import { useEffect, useState } from 'react';
// import logger from '../utils/log';
// import { ShareContextClass, useRdxStateContext, TaskEventType, ISnapShotTrigger } from '..';

// const ScheduleBatcher = (props: {
//   setNotifyBatcherOfChange: any;
//   context: React.Context<ShareContextClass>;
// }) => {
//   const storeRef = useRdxStateContext(props.context);
//   const [_, setState] = useState([]);
//   props.setNotifyBatcherOfChange(() => setState({} as any));
//   useEffect(() => {
//     if (storeRef.getNotifyQueue().size > 0 && storeRef.getAllPointFired(Array.from(storeRef.getNotifyQueue())).length > 0) {
//       logger.info('Schedule Batcher', Array.from(storeRef.getNotifyQueue()));
//       storeRef.emit(TaskEventType.BatchEventTrigger, Array.from(storeRef.getNotifyQueue()))
//       storeRef.executeTask(Array.from(storeRef.getNotifyQueue()));
//     } else {
//       storeRef.onPropsChange(storeRef.getAllTaskState(), storeRef.getTaskState())
//     }
    
//     storeRef.getNotifyQueue().clear();
//   });

//   return null;
// };

// export default ScheduleBatcher;
