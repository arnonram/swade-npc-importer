import { module } from "./global.js";

export const GetItem = async function (itemType, itemName) {
    let itemPack = GetItemCompendium(itemType);
    let packIndex = await itemPack.getIndex();
    let resultId = await packIndex.find(it => it.name.toLowerCase() == itemName.toLowerCase())["_id"];
    if (resultId != undefined) {
        console.log(`Item ${itemName}`)
        return await itemPack.getEntry(resultId);
    }
}

export const GetItemCompendium = function (itemType) {
    let compendiumName =
        game.packs.filter((comp) =>
            comp.metadata.entity == "Item" &&
            comp.metadata.module == module &&
            comp.metadata.name.includes(itemType))
            .map((comp) => {
                return `${comp.metadata.package}.${comp.metadata.name}`;
            });
    return game.packs.get(compendiumName);
};
