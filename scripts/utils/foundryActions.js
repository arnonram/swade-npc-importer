import { log, thisModule, settingPackageToUse, settingCompsToUse, settingActiveCompendiums, settingParaeLanguage } from "../global.js";

export const getItemFromCompendium = async function (itemName, expectedType) {
    let activeCompendiums = getModuleSettings(settingActiveCompendiums);
    let packs = [];
    activeCompendiums.split(',').forEach(x => {
        packs.push(game.packs.get(x));
    });

    packs  = packs.filter(function (el) {
        return el != null;
      });

    for (let i = 0; i < packs.length; i++) {
        try {
            const packIndex = await packs[i].getIndex();
            let resultId = '';
            if (expectedType === "weapon"){
                resultId = await packIndex.find(it => it.name.toLowerCase().includes(itemName.toLowerCase())); 
                if (resultId === undefined)   {
                    resultId = await packIndex.find(it => itemName.toLowerCase().includes(it.name.toLowerCase())); 
                }
            } else {
                resultId = await packIndex.find(it => it.name.toLowerCase() === (itemName.toLowerCase()));
            }            
            if (resultId != undefined) {
                let item = await packs[i].getDocument(resultId["_id"]);
                if (item.type == expectedType || item.type == ''){
                    return item;
                }
            }
        } catch (error) {
            log(`Could not find ${itemName}: ${error}`)
        }
    }
}

export const getAllActiveCompendiums = function () {
    let packs = getModuleSettings(settingPackageToUse);
    let comps = getModuleSettings(settingCompsToUse).split(',');

    if (packs.length + comps.length === 0) {
        return game.packs
            .filter((comp) => comp.documentName == "Item")
            .map((comp) => {
                return comp.collection;
            });
    } else {
        let packArray = packs.split(',');
        packArray.forEach(packName => {
            game.packs.filter((comp) =>
                // comp.metadata.entity == "Item" &&
                comp.metadata.package == packName)
                .map((comp) => {
                    comps.push(comp.collection);
                })
        });

        return Array.from(new Set(comps));
    }
}

export const GetAllItemCompendiums = function () {
    let comps = game.packs
        .filter((comp) => comp.documentName == "Item")
        .map((comp) => {
            return comp.collection;
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
}

export const getActorAddtionalStats = function () {
    return game.settings.get("swade", "settingFields").actor;
}

export const getModuleSettings = function (settingKey) {
    return game.settings.get(thisModule, settingKey);
}

export const Import = async function (actorData) {
    try {
        await Actor.createDocuments([actorData]);
        ui.notifications.info(game.i18n.format("npcImporter.HTML.ActorCreated", { actorName: actorData.name }))
    } catch (error) {
        log(`Failed to import: ${error}`)
        ui.notifications.error(game.i18n.localize("npcImporter.HTML.FailedToImport"))
    }
}

export const GetActorId = function (actorName) {
    try {
        return game.actors.getName(actorName).id;
    } catch (error) {
        return false;
    }
}

export const GetActorData = function (actorName) {
    try {
        return game.actors.getName(actorName).data;
    } catch (error) {
        return false;
    }
}

export const DeleteActor = async function (actorId) {
    try {
        await Actor.deleteDocuments([actorId]);
        ui.notifications.info(game.i18n.format("npcImporter.HTML.DeleteActor", { actorId: actorId }))
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
    return game.folders.getName(folderName).id;
}

export const updateModuleSetting = async function (settingName, newValue) {
    await game.settings.set(thisModule, settingName, newValue);
}

export const setParsingLanguage = async function (lang) {    
    log(`Setting parsing language to: ${lang}`)
    await game.i18n.setLanguage(lang);
}