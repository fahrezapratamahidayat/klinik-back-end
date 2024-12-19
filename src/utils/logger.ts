import pino from 'pino';

const logger = pino({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug'
});

// Simple logger interface
export const safeLogger = {
  info: (...args: any[]) => {
    try {
      logger.info(args);
    } catch {
      console.log(...args);
    }
  },
  error: (...args: any[]) => {
    try {
      logger.error(args);
    } catch {
      console.error(...args);
    }
  },
  warn: (...args: any[]) => {
    try {
      logger.warn(args);
    } catch {
      console.warn(...args);
    }
  },
  debug: (...args: any[]) => {
    try {
      logger.debug(args);
    } catch {
      console.debug(...args);
    }
  }
};
