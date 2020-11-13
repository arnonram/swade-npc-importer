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