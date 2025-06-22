import { settingLastSaveFolder, settingParaeLanguage } from './global';
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

export async function buildActor(
  importSettings: ImportSettings,
  textBoxStatBlock: string,
): Promise<void> {
  const rawStatBlock = textBoxStatBlock || (await getClipboardText());
  if (!rawStatBlock) {
    foundryUiError(foundryI18nLocalize('npcImporter.parser.EmptyClipboard'));
    return;
  }

  await setAllPacks();
  const currentLang = game.i18n?.lang ?? 'en';
  await setParsingLanguage(getModuleSettings(settingParaeLanguage));
  await updateModuleSetting(settingLastSaveFolder, importSettings.saveFolder);

  try {
    const parsedActor = await statBlockParser(rawStatBlock);
    const finalActor = await generateSwadeActorData(
      parsedActor,
      importSettings,
    );
    await actorImporter(finalActor);
  } catch (error) {
    Logger.error('Failed to build finalActor: ', error);
    foundryUiError('Failed to build actor. See console for details.');
  } finally {
    await setParsingLanguage(currentLang);
    resetAllPacks();
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

  if (parsedData.powerPoints) {
    finalActor.system.powerPoints = {
      value: parsedData.powerPoints,
      max: parsedData.powerPoints,
    };
  }

  Logger.info(`Actor to import: ${JSON.stringify(finalActor)}`);
  return finalActor;
}
