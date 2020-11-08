import { module, log } from "./global.js";

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
    try {
        let compendiumName =
            game.packs.filter((comp) =>
                comp.metadata.entity == "Item" &&
                comp.metadata.module == module &&
                comp.metadata.name.includes(itemType))
                .map((comp) => {
                    return `${comp.metadata.package}.${comp.metadata.name}`;
                });
        return game.packs.get(compendiumName);
    } catch (error) {
        log(`Could not find ${itemType} compendium: ${error}`)
        // ui.notifications.error(`${itemType} Compendium not found (see console for error)`)
    }
};
