import {
  thisModule,
  settingPackageToUse,
  settingCompsToUse,
  settingActiveCompendiums,
} from '../global';
import { splitAndSort } from './textUtils';
import { SwadeActorToImport } from '../types/importedActor';

import { Logger } from './logger';
import {
  foundryUiInfo,
  foundryI18nFormat,
  foundryUiError,
  foundryI18nLocalize,
} from './foundryWrappers';
import { ItemType } from '../../src/types/enums';

// Holds all active compendium packs of type 'Item'
const allPacks: any[] = [];

export async function setAllPacks(): Promise<void> {
  Logger.info('Getting all active compendiums into allPacks');
  const activeCompendiums = getModuleSettings(settingActiveCompendiums).filter(
    Boolean,
  );
  allPacks.length = 0;
  for (const comp of activeCompendiums) {
    const pack = game.packs?.get(comp);
    if (pack?.metadata.type === 'Item') {
      allPacks.push(pack);
    }
  }
}

export function resetAllPacks(): void {
  Logger.info('Resetting allPacks');
  allPacks.length = 0;
}

export async function getItemFromCompendium(
  itemName: string,
  expectedType: ItemType,
): Promise<any> {
  const item = splitAndSort(itemName);
  const itemKebab = item.join('-');
  for (const pack of allPacks) {
    try {
      let resultId: any = '';
      if (expectedType === ItemType.WEAPON) {
        resultId = pack.index.contents.find(it => it.system.swid === itemKebab);
        // ?? pack.index.contents.find(it => it.system.swid.includes(item[0]));
      } else {
        resultId = pack.index.contents.find(
          it =>
            typeof it.system.swid === 'string' && it.system.swid === itemKebab,
        );
      }

      if (resultId !== undefined) {
        const foundItem = await pack.getDocument(resultId['_id']);
        if (foundItem.type === expectedType) {
          return foundItem;
        }
      }
    } catch (error) {
      Logger.error(`Error when searching for ${itemKebab}:`, error);
    }
  }

  return {};
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
  //@ts-expect-error foundry-types
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
  //@ts-expect-error foundry-types
  return game.settings?.get('swade', 'settingFields')?.actor;
}

export function getSystemCoreSkills(): string[] {
  return (
    game.settings
      //@ts-expect-error foundry-types
      ?.get('swade', 'coreSkills')
      //@ts-expect-error foundry-types
      ?.toLowerCase()
      ?.split(',')
      ?.map(Function.prototype.call, String.prototype.trim) ?? []
  );
}

export async function importActor(
  actorData: SwadeActorToImport,
): Promise<void> {
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

export function getActorId(actorName: string): string | false {
  try {
    const actor = game.actors?.getName(actorName);
    return actor ? actor.id : false;
  } catch (error) {
    Logger.error(`Failed to get actor ID for ${actorName}: ${error}`);
    return false;
  }
}

export function getActorData(actorName: string): any {
  try {
    const actor = game.actors?.getName(actorName);
    return actor ? actor.system : false;
  } catch (error) {
    Logger.error(`Failed to get actor data for ${actorName}: ${error}`);
    return false;
  }
}

export async function deleteActor(actorId: string): Promise<void> {
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
  //@ts-expect-error foundry-types
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
  //@ts-expect-error foundry-types
  const { title, id, version } = game.modules?.get(thisModule);
  return {
    app: title,
    id,
    appVersion: version,
    importDate: new Date(Date.now()),
  };
}

export function getModuleSettings(settingKey: string): any {
  //@ts-expect-error foundry-types
  return game.settings?.get(thisModule, settingKey);
}
