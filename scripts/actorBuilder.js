import { log, settingLastSaveFolder, settingParaeLanguage } from './global.js';
import { statBlockParser } from './parseStatBlock.js';
import { actorImporter } from './actorImporter.js';
import { buildActorData } from './dataBuilders/buildActorData.js';
import { buildActorItems } from './dataBuilders/buildActorItems.js';
import { buildActorToken } from './dataBuilders/buildActorToken.js';
import {
  getFolderId,
  updateModuleSetting,
  setParsingLanguage,
  getModuleSettings,
  setAllPacks,
  resetAllPacks,
} from './utils/foundryActions.js';
import { getPowerPoints } from './utils/parserBuilderHelpers.js';

export async function buildActor(importSettings, data) {
  let clipboardText = data ? data : await getClipboardText();
  if (clipboardText) {
    await setAllPacks();
    const currentLang = game.i18n.lang;
    await setParsingLanguage(getModuleSettings(settingParaeLanguage));
    await updateModuleSetting(settingLastSaveFolder, importSettings.saveFolder);

    const parsedData = await statBlockParser(clipboardText);
    if (parsedData) {
      try {
        const finalActor = await generateActorData(parsedData, importSettings);
        await actorImporter(finalActor);
      } catch (error) {
        log('Failed to build finalActor: ' + error);
      } finally {
        await setParsingLanguage(currentLang);
        resetAllPacks();
      }
    }
  } else {
    ui.notification.error(
      game.i18n.localize('npcImporter.parser.EmptyClipboard')
    );
  }
}

async function getClipboardText() {
  return await navigator.clipboard.readText();
}

async function generateActorData(parsedData, importSettings) {
  var finalActor = {};
  finalActor.name = parsedData.Name;
  finalActor.type = importSettings.actorType;
  finalActor.folder =
    importSettings.saveFolder == ''
      ? ''
      : getFolderId(importSettings.saveFolder);
  finalActor.data = await buildActorData(
    parsedData,
    importSettings.isWildCard == 'true',
    importSettings.actorType
  );
  finalActor.items = await buildActorItems(parsedData);
  finalActor.token = await buildActorToken(
    parsedData,
    importSettings.tokenSettings
  );
  const powerPoints = powerPointsFromSpecialAbility(finalActor.items);
  if (powerPoints) {
    finalActor.data.powerPoints = {
      value: powerPoints,
      max: powerPoints,
    };
  }
  log(`Actor to import: ${JSON.stringify(finalActor)}`);
  return finalActor;
}

function powerPointsFromSpecialAbility(abilities) {
  let powerAbility = abilities.filter(
    items => items.data?.grantsPowers === true
  );
  if (powerAbility.length > 0) {
    return getPowerPoints(powerAbility[0].data.description);
  }
}
