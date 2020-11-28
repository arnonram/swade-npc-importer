import { log, thisModule, settingPackageToUse, settingCompsToUse } from "./global.js";

export const getItemFromCompendium = async function (itemName) {
    let activeCompendiums = getAllActiveCompendiums();

    for (const comp in activeCompendiums) {
        if (activeCompendiums.hasOwnProperty(comp)) {
            const element = activeCompendiums[comp];
            try {
                log(`Searching for ${itemName}`)
                let packIndex = await element.getIndex();
                let resultId = await packIndex.find(it => it.name.toLowerCase() == itemName.toLowerCase())["_id"];
                if (resultId != undefined) {
                    return element.getEntry(resultId);
                }
            } catch (error) {
                log(`Could not find ${itemName}: ${error}`)
            }
        }
    }
}


export const GetItemFromCompendium = async function (itemType, itemName) {
    let itemPack = GetItemCompendium(itemType);

    let item;
    if (itemPack != undefined) {
        try {
            log(`Searching for ${itemName}`)
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

function getAllActiveCompendiums() {
    let packs = getModuleSettings(settingPackageToUse);
    let comps = getModuleSettings(settingCompsToUse);

    let activeComps = [];

    if (packs.length + comps.length == 0) {
        activeComps = game.packs;
    } else {
        let compsFromPacks = packs.split(',').forEach(packName => {
            game.packs.filter((comp) =>
                comp.metadata.entity == "Item" &&
                comp.metadata.package == packName)
                .map((comp) => {
                    return `${comp.metadata.package}.${comp.metadata.name}`;
                })
        });

        comps.split(',').concat(compsFromPacks).forEach(x => {
            activeComps.push(game.packs.get(x));
        });
    }
}

export const GetAllItemCompendiums = function () {
    let comps = game.packs
        .filter((comp) => comp.metadata.entity == "Item")
        .map((comp) => {
            return `${comp.metadata.package}.${comp.metadata.name}`;
        });
    return Array.from(comps);
}

export const getAllPackageNames = function () {
    let uniquePackages = new Set(game.packs
        .filter((comp) => comp.metadata.package)
        .map((comp) => {
            return `${comp.metadata.package}`;
        }));
    return Array.from(uniquePackages);
}

export const getSpecificAdditionalStat = function (additionalStatName) {
    let additionalStats = game.settings.get("swade", "settingFields").actor
    for (const stat in additionalStats) {
        if (additionalStats[stat].label.toLowerCase() == additionalStatName.toLowerCase()) {
            return additionalStats[stat];
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