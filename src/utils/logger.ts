export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
}

const prefix = '[swade-npc-importer]';

export class Logger {
  static debug(message: string, ...optionalParams: unknown[]) {
    console.debug(`${prefix} [DEBUG] ${message}`, ...optionalParams);
  }

  static info(message: string, ...optionalParams: unknown[]) {
    console.info(`${prefix} [INFO] ${message}`, ...optionalParams);
  }

  static warn(message: string, ...optionalParams: unknown[]) {
    console.warn(`${prefix} [WARN] ${message}`, ...optionalParams);
  }

  static error(message: string, ...optionalParams: unknown[]) {
    console.error(`${prefix} [ERROR] ${message}`, ...optionalParams);
  }
}
