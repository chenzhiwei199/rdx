import ScheduledCore, { ScheduledTask } from '../scheduledCore';
test('测试同步任务重用', (done) => {
  const task = new ScheduledTask({
    id: 'A',
    next: () => {},
    close: () => {},
    executeCallback: (id, config) => {
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
    executeCallback: (id, config) => {
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


test('测试任务取消', () => {
  let count = 1;
  const task = new ScheduledTask({
    id: 'A',
    next: () => {},
    close: () => {},
    executeCallback: (id, config) => {
      const { next } = config;
      
      setTimeout(() => {
        // 等待1s执行结束
        count = count + 1
        next();  
      }, 1000);
    },
  });
  task.execute();
  task.pause()
  expect(task.isPause()).toBe(true)
});

test('测试队列任务取消', (done) => {
  let count = 1;
  const core = new ScheduledCore([{ id: 'A'}])
  core.start((id, config) => {
    const { next, isPause } = config;
    setTimeout(() => {
      // 等待1s执行结束
      count = count + 1
      expect(isPause()).toBe(true)
      next();  
      done()
    }, 2000);
  })
  core.update([{ id: 'A'}])
  core.start((id, config) => {
    const { next } = config;
    setTimeout(() => {
      // 等待1s执行结束
      count = count + 1
      next();  
    }, Math.random()* 1000);
  })
  core.update([{ id: 'A'}])
  core.start((id, config) => {
    const { next } = config;
    setTimeout(() => {
      // 等待1s执行结束
      count = count + 1
      next();  
    }, Math.random()* 1000);
  })
  core.update([{ id: 'A'}])
  core.start((id, config) => {
    const { next } = config;
    setTimeout(() => {
      // 等待1s执行结束
      count = count + 1
      next();  
    }, Math.random()* 1000);
  })
});
