const dev = false;
class Log {
  info(...args) {
    if (dev) {
      console.log("debugger",...args)
    }
  }
  warn(...args) {
    if (dev) {
      console.warn(...args)
    }
  }
  error(...args) {
    if (dev) {
      console.error(...args)
    }
  }
}

const logger = new Log();
export default logger;
