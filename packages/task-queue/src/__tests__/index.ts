import { ScheduledTask } from '../scheduledCore';
test('测试同步任务重用', (done) => {
  const task = new ScheduledTask({
    id: 'A',
    next: () => {},
    close: () => {},
    callback: (id, config) => {
      const { next } = config;
      next();
      setTimeout(() => {
        // 等待1s执行结束
        
      }, 1000);
    },
  });
  task.execute();
  const forkTask = task.fork({
    next: () => {
      done();
    },
    close: () => {},
  });
  forkTask.execute();
});


test('测试异步任务重用', (done) => {
  let count = 1;
  const task = new ScheduledTask({
    id: 'A',
    next: () => {},
    close: () => {},
    callback: (id, config) => {
      const { next } = config;
      
      setTimeout(() => {
        // 等待1s执行结束
        count = count + 1
        next();  
      }, 1000);
    },
  });
  task.execute();
  const forkTask = task.fork({
    next: () => {
      expect(count).toBe(2)
      done();
    },
    close: () => {},
  });
  forkTask.execute();
});
