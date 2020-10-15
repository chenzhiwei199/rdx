declare class Log {
    info(...args: any[]): void;
    warn(...args: any[]): void;
    error(...args: any[]): void;
}
declare const logger: Log;
export default logger;
