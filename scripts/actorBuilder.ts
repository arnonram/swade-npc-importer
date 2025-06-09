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
} from './utils/foundryActions';
import {
  SwadeActorToImport,
  ParsedActor,
  ImportSettings,
} from './types/importedActor';

export async function buildActor(
  importSettings: ImportSettings,
  textBoxStatBlock: string,
): Promise<void> {
  const rawStatBlock = textBoxStatBlock
    ? textBoxStatBlock
    : await getClipboardText();
  if (rawStatBlock) {
    await setAllPacks();
    const currentLang = game.i18n?.lang ?? 'en';
    await setParsingLanguage(getModuleSettings(settingParaeLanguage));
    await updateModuleSetting(settingLastSaveFolder, importSettings.saveFolder);

    try {
      const parsedActor: ParsedActor = await statBlockParser(rawStatBlock);
      const finalActor = await generateSwadeActorData(
        parsedActor,
        importSettings,
      );
      await actorImporter(finalActor);
    } catch (error) {
      console.error('Failed to build finalActor: ' + error);
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

async function generateSwadeActorData(
  parsedData: ParsedActor,
  importSettings: ImportSettings,
): Promise<any> {
  var finalActor: SwadeActorToImport = {
    name: parsedData.name,
    type: importSettings.actorType,
    folder: importSettings.saveFolder,
    system: await buildActorData(
      parsedData,
      importSettings.isWildCard == 'true',
      importSettings.actorType,
    ),
    items: await buildActorItems(parsedData),
    prototypeToken: await buildActorToken(
      parsedData,
      importSettings.tokenSettings,
    ),
    flags: { importerApp: getImporterModuleData() },
  };

  if (parsedData.powerPoints) {
    finalActor.system.powerPoints = {
      value: parsedData.powerPoints,
      max: parsedData.powerPoints,
    };
  }

  console.log(`Actor to import: ${JSON.stringify(finalActor)}`);
  return finalActor;
}
