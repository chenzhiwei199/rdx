const sum = (a, b) => {
  return a + b
}

test('adds 1 + 2 to equal 3', () => {
  expect(sum(1, 2)).toBe(3);
});
// 用例
// atom 静态值， atom使用atom， atom使用selector
// selector async 方法， 同步方法， 
// atom同步，atom异步
// selector同步， selector异步

// 同步-> 同步
// 异步 -> 同步
// 异步 -> 异步
// 