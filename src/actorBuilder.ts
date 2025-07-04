import { settingLastSaveFolder, settingParseLanguage } from './global';
import { statBlockParser } from './statBlockParser/parseStatBlock';
import { actorImporter } from './actorImporter';
import { buildActorData } from './dataBuilders/buildActorData';
import { buildActorItems } from './dataBuilders/buildActorItems';
import { buildActorToken } from './dataBuilders/buildActorToken';
import {
  updateModuleSetting,
  setParsingLanguage,
  getModuleSettings,
  setAllPacks,
  resetAllPacks,
  getImporterModuleData,
  getFolderId,
} from './utils/foundryActions';
import {
  SwadeActorToImport,
  ParsedActor,
  ImportSettings,
} from './types/importedActor';
import { Logger } from './utils/logger';
import { foundryI18nLocalize, foundryUiError } from './utils/foundryWrappers';

function logActorSummary(actor: SwadeActorToImport) {
  Logger.info(
    `Actor to import: name=${actor.name}, type=${actor.type}, folder=${actor.folder}`,
  );
}

export async function buildActor(
  importSettings: ImportSettings,
  textBoxStatBlock?: string,
): Promise<void> {
  let rawStatBlock = textBoxStatBlock;
  if (!rawStatBlock) {
    try {
      rawStatBlock = await getClipboardText();
    } catch (err) {
      Logger.error('Clipboard read failed:', err);
      foundryUiError(
        foundryI18nLocalize('npcImporter.parser.ClipboardPermissionError'),
      );
      return;
    }
  }
  if (!rawStatBlock) {
    foundryUiError(foundryI18nLocalize('npcImporter.parser.EmptyClipboard'));
    return;
  }

  await setAllPacks();
  const currentLang = game.i18n?.lang ?? 'en';
  await setParsingLanguage(getModuleSettings(settingParseLanguage));
  await updateModuleSetting(settingLastSaveFolder, importSettings.saveFolder);

  try {
    const parsedActor = await statBlockParser(rawStatBlock);
    const finalActor = await generateSwadeActorData(
      parsedActor,
      importSettings,
    );
    logActorSummary(finalActor);
    await actorImporter(finalActor);
  } catch (error: any) {
    Logger.error('Failed to build finalActor: ', error);
    foundryUiError(
      foundryI18nLocalize('npcImporter.parser.BuildActorError') +
        (error?.message ? `: ${error.message}` : ''),
    );
  } finally {
    await setParsingLanguage(currentLang);
    await resetAllPacks();
  }
}

async function getClipboardText(): Promise<string> {
  return navigator.clipboard.readText();
}

async function generateSwadeActorData(
  parsedData: ParsedActor,
  importSettings: ImportSettings,
): Promise<SwadeActorToImport> {
  const { actorType, saveFolder, isWildCard, tokenSettings } = importSettings;
  const finalActor: SwadeActorToImport = {
    name: parsedData.name,
    type: actorType,
    folder: getFolderId(saveFolder),
    system: await buildActorData(parsedData, isWildCard, actorType),
    items: await buildActorItems(parsedData),
    prototypeToken: await buildActorToken(parsedData, tokenSettings),
    flags: { importerApp: getImporterModuleData() },
  };

  if (typeof parsedData.powerPoints === 'number') {
    finalActor.system.powerPoints = {
      value: parsedData.powerPoints,
      max: parsedData.powerPoints,
    };
  }

  Logger.debug('Final actor data:', finalActor);

  return finalActor;
}
