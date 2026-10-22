import {REACT_APP_LOGGING} from '@env';

const enabled = REACT_APP_LOGGING === 'true';

export const logger = {
  log: (...args: any[]) => {
    if (enabled) {
      console.log(...args);
    }
  },
  error: (...args: any[]) => {
    if (enabled) {
      console.error(...args);
    }
  },
  warn: (...args: any[]) => {
    if (enabled) {
      console.warn(...args);
    }
  },
};
