import {
  log,
  thisModule,
  settingPackageToUse,
  settingCompsToUse,
  settingActiveCompendiums,
  allPacks,
} from '../global.js';
import { splitAndSort } from './textUtils.js';

export async function setAllPacks() {
  log('Getting all active compendiums into allPacks');
  let activeCompendiums = getModuleSettings(settingActiveCompendiums);
  activeCompendiums
    .split(',')
    .filter(String)
    .forEach(comp => {
      if (game.packs.get(comp).metadata.type === 'Item') {
        allPacks.push(game.packs.get(comp));
      }
    });
  allPacks.filter(function (el) {
    return el != null;
  });
}

export function resetAllPacks() {
  log('Resetting allPacks');
  allPacks.length = 0;
}

export async function getItemFromCompendium(itemName, expectedType = '') {
  let item = splitAndSort(itemName);
  for (let i = 0; i < allPacks.length; i++) {
    try {
      let resultId = '';
      if (expectedType === 'weapon') {
        resultId = allPacks[i].index.contents.find(
          it => splitAndSort(it.name) == item
        );
        if (resultId === undefined) {
          resultId = allPacks[i].index.contents.find(it =>
            item.includes(splitAndSort(it.name))
          );
        }
      } else {
        resultId = allPacks[i].index.contents.find(
          it => splitAndSort(it.name) === item
        );
      }
      if (resultId != undefined) {
        const item = await allPacks[i].getDocument(resultId['_id']);
        if (item.type === expectedType) {
          return item;
        }
      }
    } catch (error) {
      log(`Error when searching for ${item}: ${error}`);
    }
  }
  return { data: {} };
}

export const getAllActiveCompendiums = function () {
  let packs = getModuleSettings(settingPackageToUse);
  let comps = getModuleSettings(settingCompsToUse).split(',');

  if (packs.length + comps.length === 0) {
    return game.packs
      .filter(comp => comp.documentName == 'Item')
      .map(comp => {
        return comp.collection;
      });
  } else {
    let packArray = packs.split(',');
    packArray.forEach(packName => {
      game.packs
        .filter(
          comp =>
            // comp.metadata.entity == "Item" &&
            comp.metadata.package == packName
        )
        .map(comp => {
          comps.push(comp.collection);
        });
    });

    return Array.from(new Set(comps));
  }
};

export const getAllItemCompendiums = function () {
  let comps = game.packs
    .filter(comp => comp.documentName == 'Item')
    .map(comp => {
      return comp.collection;
    });
  return Array.from(comps);
};

export const getAllPackageNames = function () {
  let uniquePackages = new Set(
    game.packs
      .filter(comp => comp.metadata.package)
      .map(comp => {
        return `${comp.metadata.package}`;
      })
  );
  return Array.from(uniquePackages);
};

export const getSpecificAdditionalStat = function (additionalStatName) {
  let additionalStats = game.settings.get('swade', 'settingFields').actor;
  for (const stat in additionalStats) {
    if (
      additionalStats[stat].label.toLowerCase() ==
      additionalStatName.toLowerCase()
    ) {
      return additionalStats[stat];
    }
  }
};

export const getActorAddtionalStatsArray = function () {
  let actorAdditionalStats = getActorAddtionalStats();
  let stats = [];
  for (const key in actorAdditionalStats) {
    if (actorAdditionalStats.hasOwnProperty(key)) {
      const element = actorAdditionalStats[key];
      stats.push(`${element.label}:`);
    }
  }
  return stats;
};

export const getActorAddtionalStats = function () {
  return game.settings.get('swade', 'settingFields').actor;
};

export const getSystemCoreSkills = function () {
  return game.settings
    .get('swade', 'coreSkills')
    .toLowerCase()
    .split(',')
    .map(Function.prototype.call, String.prototype.trim);
};

export const getModuleSettings = function (settingKey) {
  return game.settings.get(thisModule, settingKey);
};

export const Import = async function (actorData) {
  try {
    await Actor.createDocuments([actorData]);
    ui.notifications.info(
      game.i18n.format('npcImporter.HTML.ActorCreated', {
        actorName: actorData.name,
      })
    );
  } catch (error) {
    log(`Failed to import: ${error}`);
    ui.notifications.error(
      game.i18n.localize('npcImporter.HTML.FailedToImport')
    );
  }
};

export const GetActorId = function (actorName) {
  try {
    return game.actors.getName(actorName).id;
  } catch (error) {
    return false;
  }
};

export const GetActorData = function (actorName) {
  try {
    return game.actors.getName(actorName).data;
  } catch (error) {
    return false;
  }
};

export const DeleteActor = async function (actorId) {
  try {
    await Actor.deleteDocuments([actorId]);
    ui.notifications.info(
      game.i18n.format('npcImporter.HTML.DeleteActor', { actorId: actorId })
    );
  } catch (error) {
    log(`Failed to delet actor: ${error}`);
  }
};

export const getAllActorFolders = function () {
  return game.folders
    .filter(x => x.data.type === 'Actor')
    .map(comp => {
      return `${comp.data.name}`;
    });
};

export const getFolderId = function (folderName) {
  return game.folders.getName(folderName).id;
};

export const updateModuleSetting = async function (settingName, newValue) {
  await game.settings.set(thisModule, settingName, newValue);
};

export const setParsingLanguage = async function (lang) {
  log(`Setting parsing language to: ${lang}`);
  await game.i18n.setLanguage(lang);
};
