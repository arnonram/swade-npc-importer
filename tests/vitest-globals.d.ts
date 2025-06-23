export {};

declare global {
  //@ts-ignore
  var game: {
    i18n: {
      localize: (key: string) => string;
    };
  };
  //@ts-ignore
  var ui: {
    notifications: {
      info: (msg: string) => void;
      error: (msg: string) => void;
    };
  };
}
