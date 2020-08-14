const dev = true
class Log {
  info(...args) {
    if(dev) {
      console.log(...args)
    }
  }
  warn(...args) {
    if(dev) {
      console.log(...args)
    }
  }
  error(...args) {
    if(dev) {
      console.log(...args)
    }
  }
}

const logger = new Log()
export default logger