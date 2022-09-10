import { PlaywrightTestConfig } from '@playwright/test';

const config: PlaywrightTestConfig = {
  use: {
    contextOptions: {
      bypassCSP: true,
      permissions: ['clipboard-read', 'clipboard-write'],
    },
  },
  testDir: './tests',
  fullyParallel: false,
  timeout: 10000,
};
export default config;
