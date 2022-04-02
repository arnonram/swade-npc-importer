// the testData directory is not being commited
// since i'm using official data and i do not infringe on copyrights stuff

import { test, expect, chromium, Page } from '@playwright/test';
import fs from 'fs';
import { cleanActor } from './utils/cleanup';
import { FoundryApp } from './utils/foundry-pom';
import { Languages } from './utils/languages';
const expectedPath = `${__dirname}/testData/expected/`;

let page: Page;

test.describe('Other Languages Test', () => {
  let actorUnderTest = '';
  let foundryApp: FoundryApp;

  test.beforeAll(async ({ browser }) => {
    browser = await chromium.launch({
      executablePath: '/usr/bin/brave-browser',
    });
    const context = await browser.newContext({
      bypassCSP: true,
      permissions: ['clipboard-read', 'clipboard-write'],
    });

    page = await context.newPage();
    foundryApp = new FoundryApp(page);
    await foundryApp.login();
  });

  test.afterEach(async () => {
    await foundryApp.deleteActor(actorUnderTest);
  });

  const actors = [
    { actorName: 'goblin', lang: Languages.English },
    { actorName: 'gregorovna', lang: Languages.English },
    { actorName: 'dragon', lang: Languages.English },
    { actorName: 'scorpion', lang: Languages.English },
    { actorName: 'de-zombie', lang: Languages.German },
    { actorName: 'de-bull', lang: Languages.German },
    { actorName: 'de-lich', lang: Languages.German },
    { actorName: 'es-Momia', lang: Languages.Spanish },
    { actorName: 'es-Aracano', lang: Languages.Spanish },
    { actorName: 'por-Bull', lang: Languages.PortugueseBrazil },
  ];

  for (const testData of actors) {
    test(`testing with actor: ${testData.actorName}, in language: ${testData.lang}`, async () => {
      await foundryApp.setLanguage(testData.lang);
      const expectedData = JSON.parse(
        fs.readFileSync(`${expectedPath}${testData.actorName}.json`, 'utf-8')
      );
      actorUnderTest = expectedData.name;

      await foundryApp.importActor(testData.actorName);
      const path = await foundryApp.exportActor(actorUnderTest);

      expect(path).not.toBeNull();

      if (path) {
        const exportedData = JSON.parse(fs.readFileSync(path, 'utf-8'));
        expect(cleanActor(exportedData)).toEqual(cleanActor(expectedData));
      }
    });
  }
});
