import * as itemBuilder from "./itemBuilder.js";
import { SpecialAbilitiesParser } from "./buildActorItemsSpecialAbilities.js"
import { ItemGearBuilder } from "./buildActorGear.js";

export const BuildActorItems = async function (parsedData) {
    let items = [];
    let skills = await itemBuilder.SkillBuilder(parsedData.Skills) ?? [];
    let edges = await itemBuilder.EdgeBuilder(parsedData.Edges) ?? [];
    let hindrances = await itemBuilder.HindranceBuilder(parsedData.Hindrances) ?? [];
    let powers = await itemBuilder.PowerBuilder(parsedData.Powers) ?? [];
    let specialAbilities = await SpecialAbilitiesParser(parsedData.SpecialAbilities) ?? [];
    let gear = await ItemGearBuilder(parsedData.Gear) ?? [];

    items = items.concat(skills, edges, hindrances, powers, specialAbilities, gear);
    return postProcessChecks(items);
}

function postProcessChecks(actorItems) {
    let finalItems = checkBruteEdge(actorItems);
    return finalItems;
}

function checkBruteEdge(actorItems) {
    if (actorItems.find(item => item.name === game.i18n.localize("npcImporter.parser.Brute")) &&
        actorItems.find(item => item.name === game.i18n.localize("npcImporter.parser.Athletics"))) {
        actorItems.find(item => {
            if (item.name === game.i18n.localize("npcImporter.parser.Athletics")) {
                item.data.attribute = 'strength';
            }
        });
    }
    return actorItems;
}