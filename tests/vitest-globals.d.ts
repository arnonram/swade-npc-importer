export {};

declare global {
  //@ts-ignore
  var game: {
    i18n: {
      localize: (key: string) => string;
    };
  };
}
