// the testData directory is not being commited
// since i'm using official data and i do not infringe on copyrights stuff

import { test, expect, chromium, Page } from '@playwright/test';
import fs from 'fs';
import { cleanActor } from './utils/cleanup';
import { FoundryApp } from './utils/foundry-pom';
import { ActoryType, Disposition, Languages } from './utils/enums';
const expectedPath = `${__dirname}/testData/expected/`;

let page: Page;

test.describe('Importer Test', () => {
  let actorUnderTest = '';
  let foundryApp: FoundryApp;

  test.beforeAll(async ({ browser }) => {
    browser = await chromium.launch();
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
    {
      actorName: 'goblin',
      lang: Languages.English,
      special: {
        actoryType: ActoryType.Character,
        isWildcard: true,
        disposition: Disposition.Friendly,
        hasVision: true,
        dimSight: 30,
        brightSight: 30,
      },
    },
    { actorName: 'dragon', lang: Languages.English },
    { actorName: 'gregorovna', lang: Languages.English },
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

      await foundryApp.openImporter();
      if (testData.special) {
        await foundryApp.selectActorType(testData.special.actoryType);
        await foundryApp.selectIsWildCard(testData.special.isWildcard);
        await foundryApp.selectDisposition(testData.special.disposition);
        await foundryApp.updateVision(
          testData.special.hasVision,
          testData.special.dimSight,
          testData.special.brightSight
        );
      }

      await foundryApp.importActor(testData.actorName);
      const path = await foundryApp.exportActor(actorUnderTest);

      expect(path).not.toBeNull();

      if (path) {
        const exportedData = JSON.parse(fs.readFileSync(path, 'utf-8'));
        await fs.writeFileSync(
          `${expectedPath}new/${testData.actorName}.json`,
          fs.readFileSync(path, 'utf-8')
        );
        expect(cleanActor(exportedData)).toEqual(cleanActor(expectedData));
      }
    });
  }
});
