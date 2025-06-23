import en from '../src/lang/en.json';
import { vi } from 'vitest';

vi.mock('../src/utils/foundryWrappers', () => ({
  foundryI18nLocalize: (key: string) => en[key] || key,
  foundryUiInfo: (msg: string) => globalThis.ui.notifications.info(msg),
  foundryUiError: (msg: string) => globalThis.ui.notifications.error(msg),
}));

//@ts-ignore
globalThis.game = {
  i18n: {
    localize: (key: string) => en[key] || key,
  },
};

//@ts-ignore
globalThis.ui = {
  notifications: {
    info: vi.fn(),
    error: vi.fn(),
  },
};
