import en from '../src/lang/en.json';

//@ts-ignore
globalThis.game = {
  i18n: {
    localize: (key: string) => en[key] || key,
  },
};
