import 'chrome'
declare interface Widnow {
  chrome: typeof chrome;
  do_something: (msg: string) => void;
  getCacheData: () => any
} 
