export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
}

const PREFIX = '[swade-npc-importer]';

export class Logger {
  static debug(message: string, ...optionalParams: unknown[]) {
    console.debug(`${PREFIX} [DEBUG] ${message}`, ...optionalParams);
  }

  static info(message: string, ...optionalParams: unknown[]) {
    console.info(`${PREFIX} [INFO] ${message}`, ...optionalParams);
  }

  static warn(message: string, ...optionalParams: unknown[]) {
    console.warn(`${PREFIX} [WARN] ${message}`, ...optionalParams);
  }

  static error(message: string, ...optionalParams: unknown[]) {
    console.error(`${PREFIX} [ERROR] ${message}`, ...optionalParams);
  }
}
