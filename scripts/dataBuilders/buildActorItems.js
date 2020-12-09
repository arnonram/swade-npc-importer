import * as itemBuilder from "./itemBuilder.js";
import { SpecialAbilitiesParser } from "./buildActorItemsSpecialAbilities.js"
import { ItemGearBuilder } from "./buildActorGear.js";

export const BuildActorItems = async function(parsedData) {
    let items = [];
    let skills = await itemBuilder.SkillBuilder(parsedData.Skills) ?? [];
    let edges = await itemBuilder.EdgeBuilder(parsedData.Edges) ?? [];
    let hindrances = await itemBuilder.HindranceBuilder(parsedData.Hindrances) ?? [];
    let powers = await itemBuilder.PowerBuilder(parsedData.Powers) ?? [];
    let specialAbilities = await SpecialAbilitiesParser(parsedData[game.i18n.localize("npcImporter.parser.SpecialAbilities")]) ?? [];
    let gear = await ItemGearBuilder(parsedData.Gear) ?? [];

    items = items.concat(skills, edges, hindrances, powers, specialAbilities, gear);
    return items;
}