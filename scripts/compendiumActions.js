import { log, thisModule, settingPackageToUse } from "./global.js";

export const GetItemFromCompendium = async function (itemType, itemName) {
    let itemPack = GetItemCompendium(itemType);

    if (itemPack != undefined) {
        try {
            log(`Searching for ${itemName} in ${itemPack}`)
            let packIndex = await itemPack.getIndex();
            let resultId = await packIndex.find(it => it.name.toLowerCase() == itemName.toLowerCase())["_id"];
            if (resultId != undefined) {
                console.log(`Item ${itemName}`)
                return await itemPack.getEntry(resultId);
            }
        } catch (error) {
            log(`Could not find ${itemName}: ${error}`)
        }
    }
}

export const GetItemCompendium = function (itemType) {
    const packageToUse = game.settings.get(thisModule, settingPackageToUse)
    try {
        let compendiumName =
            game.packs.filter((comp) =>
                comp.metadata.entity == "Item" &&
                comp.metadata.package == packageToUse &&
                comp.metadata.name.includes(itemType))
                .map((comp) => {
                    return `${comp.metadata.package}.${comp.metadata.name}`;
                });
        return game.packs.get(compendiumName);
    } catch (error) {
        log(`Could not find ${itemType} compendium: ${error}`)
        ui.notifications.error(`${itemType} Compendium not found (see console for error)`)
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