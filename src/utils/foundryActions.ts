import {
  thisModule,
  settingPackageToUse,
  settingCompsToUse,
  settingActiveCompendiums,
  allPacks,
} from '../global.js';
import { splitAndSort } from './textUtils.js';
import { SwadeActorToImport } from '../types/importedActor.js';
import {
  foundryI18nFormat,
  foundryI18nLocalize,
  foundryUiError,
  foundryUiInfo,
} from './foundryWrappers.js';
import { Logger } from './logger.js';

export async function setAllPacks(): Promise<void> {
  Logger.info('Getting all active compendiums into allPacks');
  let activeCompendiums = getModuleSettings(settingActiveCompendiums);
  activeCompendiums.filter(String).forEach((comp: string) => {
    if (game.packs?.get(comp)?.metadata.type === 'Item') {
      allPacks.push(game.packs.get(comp));
    }
  });
  allPacks.filter(function (el: any) {
    return el != null;
  });
}

export function resetAllPacks(): void {
  Logger.info('Resetting allPacks');
  allPacks.length = 0;
}

export async function getItemFromCompendium(
  itemName: string,
  expectedType = '',
): Promise<any> {
  let item = splitAndSort(itemName);
  for (let i = 0; i < allPacks.length; i++) {
    try {
      let resultId: any = '';
      if (expectedType === 'weapon') {
        resultId = allPacks[i].index.contents.find(
          (it: any) => splitAndSort(it.name) == item,
        );
        if (resultId === undefined) {
          resultId = allPacks[i].index.contents.find((it: any) =>
            item.includes(splitAndSort(it.name)),
          );
        }
      } else {
        resultId = allPacks[i].index.contents.find(
          (it: any) => splitAndSort(it.name) === item,
        );
      }
      if (resultId != undefined) {
        const item = await allPacks[i].getDocument(resultId['_id']);
        if (item.type === expectedType) {
          return item;
        }
      }
    } catch (error) {
      Logger.error(`Error when searching for ${item}: ${error}`);
    }
  }
  return { system: {} };
}

export function getAllActiveCompendiums(): string[] {
  let packs = getModuleSettings(settingPackageToUse);
  let comps = getModuleSettings(settingCompsToUse);

  if (packs.length + comps.length === 0) {
    if (!game.packs) {
      return [];
    }
    return game.packs
      ?.filter((comp: any) => comp?.documentName == 'Item')
      .map((comp: any) => comp?.collection)
      .filter(Boolean);
  } else {
    packs.forEach((packName: string) => {
      game.packs?.contents
        ?.filter((x: any) => x?.metadata?.packageName === packName)
        .forEach((comp: any) => {
          if (comp?.collection) comps.push(comp.collection);
        });
    });
    return Array.from(new Set(comps));
  }
}

export function getAllItemCompendiums(): string[] {
  if (!game.packs) return [];
  let comps = game.packs
    ?.filter((comp: any) => comp?.documentName == 'Item')
    .map((comp: any) => comp?.collection)
    .filter(Boolean);
  return Array.from(comps);
}

export function getAllPackageNames(): string[] {
  if (!game.packs) return [];
  let uniquePackages = new Set(
    game.packs
      ?.filter((comp: any) => comp?.metadata?.type === 'Item')
      .map((comp: any) => `${comp?.metadata?.packageName}`)
      .filter(Boolean),
  );
  return Array.from(uniquePackages);
}

export function getSpecificAdditionalStat(additionalStatName: string): any {
  //@ts-ignore
  let additionalStats = game.settings?.get('swade', 'settingFields')?.actor;
  for (const stat in additionalStats) {
    if (
      additionalStats[stat].label.toLowerCase() ==
      additionalStatName.toLowerCase()
    ) {
      return additionalStats[stat];
    }
  }
}

export function getActorAddtionalStatsArray(): string[] {
  let actorAdditionalStats = getActorAddtionalStats();
  let stats: string[] = [];
  for (const key in actorAdditionalStats) {
    if (actorAdditionalStats.hasOwnProperty(key)) {
      const element = actorAdditionalStats[key];
      stats.push(`${element.label}:`);
    }
  }
  return stats;
}

export function getActorAddtionalStats(): any {
  //@ts-ignore
  return game.settings?.get('swade', 'settingFields')?.actor;
}

export function getSystemCoreSkills(): string[] {
  return (
    game.settings
      //@ts-ignore
      ?.get('swade', 'coreSkills')
      //@ts-ignore
      ?.toLowerCase()
      ?.split(',')
      ?.map(Function.prototype.call, String.prototype.trim) ?? []
  );
}

export async function Import(actorData: SwadeActorToImport): Promise<void> {
  //Throw a hook with the actorData before creation:
  Hooks.call('npcImporter-preCreateActor', actorData);
  try {
    const actors = await Actor.createDocuments([actorData as any]);
    foundryUiInfo(
      foundryI18nFormat('npcImporter.HTML.ActorCreated', {
        actorName: actorData.name,
      }),
    );
    //Throw a hook containing the actors:
    Hooks.call('npcImporter-ActorCreated', actors);
    // Render actor sheet (optionally):
    if (actors[0].sheet && getModuleSettings('renderSheet') === true) {
      actors[0]?.sheet.render(true);
    }
  } catch (error) {
    Logger.error(`Failed to import: ${error}`);
    foundryUiError(foundryI18nLocalize('npcImporter.HTML.FailedToImport'));
  }
}

export function GetActorId(actorName: string): string | false {
  try {
    const actor = game.actors?.getName(actorName);
    return actor ? actor.id : false;
  } catch (error) {
    return false;
  }
}

export function GetActorData(actorName: string): any {
  try {
    const actor = game.actors?.getName(actorName);
    return actor ? actor.system : false;
  } catch (error) {
    return false;
  }
}

export async function DeleteActor(actorId: string): Promise<void> {
  try {
    await Actor.deleteDocuments([actorId]);
    foundryUiInfo(
      foundryI18nFormat('npcImporter.HTML.DeleteActor', {
        actorId: actorId,
      }),
    );
  } catch (error) {
    Logger.error(`Failed to delete actor: ${error}`);
  }
}

export async function deleteAllActors(): Promise<void> {
  if (!game.actors) return;
  const allActors = game.actors.map((x: any) => x.data._id);
  await Actor.deleteDocuments(allActors);
}

export function getAllActorFolders(): string[] {
  if (!game.folders?._source) return [];
  return game.folders._source
    .filter((x: any) => x.type === 'Actor')
    .map((folder: any) => {
      return `${folder.name}`;
    });
}

export function getFolderId(folderName: string): string {
  return game.folders?.getName(folderName)?.id ?? '';
}

export async function updateModuleSetting(
  settingName: string,
  newValue: any,
): Promise<void> {
  //@ts-ignore
  await game.settings?.set(thisModule, settingName, newValue);
}

export async function setParsingLanguage(lang: string): Promise<void> {
  Logger.info(`Setting parsing language to: ${lang}`);
  await game.i18n?.setLanguage(lang);
}

export function getImporterModuleData(): {
  app: string;
  id: string;
  appVersion: string;
  importDate: Date;
} {
  //@ts-ignore
  const { title, id, version } = game.modules?.get(thisModule);
  return {
    app: title,
    id,
    appVersion: version,
    importDate: new Date(Date.now()),
  };
}

export function getModuleSettings(settingKey: string): any {
  //@ts-ignore
  return game.settings?.get(thisModule, settingKey);
}
