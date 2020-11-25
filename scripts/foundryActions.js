import { log, thisModule, settingPackageToUse } from "./global.js";

export const GetItemFromCompendium = async function (itemType, itemName) {
    let itemPack = GetItemCompendium(itemType);

    let item;
    if (itemPack != undefined) {
        try {
            log(`Searching for ${itemName} in ${itemPack}`)
            let packIndex = await itemPack.getIndex();
            let resultId = await packIndex.find(it => it.name.toLowerCase() == itemName.toLowerCase())["_id"];
            if (resultId != undefined) {
                item = itemPack.getEntry(resultId);
            }
        } catch (error) {
            log(`Could not find ${itemName}: ${error}`)
        }
    }
    return item;
}

export const GetItemCompendium = function (itemType) {
    try {
        const packageToUse = game.settings.get(thisModule, settingPackageToUse);
        let compendiumName =
            game.packs.filter((comp) =>
                comp.metadata.entity == "Item" &&
                comp.metadata.package == packageToUse &&
                comp.metadata.name.includes(itemType))
                .map((comp) => {
                    return `${comp.metadata.package}.${comp.metadata.name}`;
                });
        return game.packs.get(compendiumName[0]);
    } catch (error) {
        log(`Could not find ${itemType} compendium: ${error}`)
    }
};

export const GetAllItemCompendiums = function () {
    return game.packs
        .filter((comp) => comp.metadata.entity == "Item")
        .map((comp) => {
            return `${comp.metadata.package}.${comp.metadata.name}`;
        });
}

export const GetAllPackageNames = function () {
    let uniquePackages = new Set(game.packs
        .filter((comp) => comp.metadata.package)
        .map((comp) => {
            return `${comp.metadata.package}`;
        }));
    let packDict = {};
    uniquePackages.forEach((comp) => {
        packDict[comp] = comp;
    })

    return packDict;
}

export const getSpecificAdditionalStat = function (additionalStatName) {
    let additionalStats = getActorAddtiionalStats();
    for (const stat in additionalStats) {
        if (additionalStats[stat].label.toLowerCase() == additionalStatName.toLowerCase()) {
            return stat;
        }
    }
}

export const getActorAddtionalStats = function () {
    let actorAdditionalStats = game.settings.get("swade", "settingFields").actor;
    let stats = [];
    for (const key in actorAdditionalStats) {
        stats.push(`${key}:`);
    }
    return stats;
}

export const getModuleSettings = function (settingKey) {
    log(`Getting settings for: ${settingKey}`)
    return game.settings.get(thisModule, settingKey);
}

export const Import = async function (actorData) {
    try {
        await Actor.create(actorData);
        ui.notifications.info(`${actorData.name} created successfully`)
    } catch (error) {
        log(`Failed to import: ${error}`)
        ui.notifications.error("Failed to import actor (see console for errors)")
    }
}

export const GetActorId = function (actorName) {
    try {
        return game.actors.getName(actorName).data._id;
    } catch (error) {
        log(`Actor not found`);
        return false;
    }
}

export const DeleteActor = async function (actorId) {
    try {
        await Actor.delete(actorId);
        ui.notifications.info(`Delete Actor with id ${actorId}`)
    } catch (error) {
        log(`Failed to delet actor: ${error}`)
    }
}

export const getAllActorFolders = function () {
    return game.folders.filter(x => x.data.type === "Actor")
        .map((comp) => {
            return `${comp.data.name}`;
        });
}

export const getFolderId = function (folderName) {
    return game.folders.getName(folderName)._id;
}

export const updateModuleSetting = async function (settingName, newValue) {
    await game.settings.set(thisModule, settingName, newValue);
}