import { log, settingLastSaveFolder, settingParaeLanguage } from './global';
import { statBlockParser } from './parseStatBlock';
import { actorImporter } from './actorImporter';
import { buildActorData } from './dataBuilders/buildActorData';
import { buildActorItems } from './dataBuilders/buildActorItems';
import { buildActorToken } from './dataBuilders/buildActorToken';
import {
  getFolderId,
  updateModuleSetting,
  setParsingLanguage,
  getModuleSettings,
  setAllPacks,
  resetAllPacks,
  getImporterModuleData,
} from './utils/foundryActions';
import { getBonus } from './utils/parserBuilderHelpers';

export async function buildActor(
  importSettings: any,
  data: any,
): Promise<void> {
  let clipboardText = data ? data : await getClipboardText();
  if (clipboardText) {
    await setAllPacks();
    const currentLang = game.i18n?.lang ?? 'en';
    await setParsingLanguage(getModuleSettings(settingParaeLanguage));
    await updateModuleSetting(settingLastSaveFolder, importSettings.saveFolder);

    try {
      const parsedData = await statBlockParser(clipboardText);
      const finalActor = await generateActorData(parsedData, importSettings);
      await actorImporter(finalActor);
    } catch (error) {
      log('Failed to build finalActor: ' + error);
    } finally {
      await setParsingLanguage(currentLang);
      resetAllPacks();
    }
  } else {
    ui.notifications?.error(
      game.i18n?.localize('npcImporter.parser.EmptyClipboard') as string,
    );
  }
}

async function getClipboardText(): Promise<string> {
  return await navigator.clipboard.readText();
}

async function generateActorData(
  parsedData: any,
  importSettings: any,
): Promise<any> {
  var finalActor: any = {};
  finalActor.name = parsedData.Name;
  finalActor.type = importSettings.actorType;
  finalActor.folder =
    importSettings.saveFolder == ''
      ? ''
      : getFolderId(importSettings.saveFolder);
  finalActor.system = await buildActorData(
    parsedData,
    importSettings.isWildCard == 'true',
    importSettings.actorType,
  );
  finalActor.items = await buildActorItems(parsedData);
  finalActor.prototypeToken = await buildActorToken(
    parsedData,
    importSettings.tokenSettings,
  );
  const powerPoints = powerPointsFromSpecialAbility(finalActor.items);
  if (powerPoints) {
    finalActor.system.powerPoints = {
      value: powerPoints,
      max: powerPoints,
    };
  }
  finalActor.flags = { importerApp: getImporterModuleData() };
  log(`Actor to import: ${JSON.stringify(finalActor)}`);
  return finalActor;
}

function powerPointsFromSpecialAbility(abilities: any[]): number | undefined {
  let powerAbility = abilities.filter(
    items => items.system?.grantsPowers === true,
  );
  if (powerAbility.length > 0) {
    return getBonus(powerAbility[0].system.description, 'powerPoints');
  }
}
