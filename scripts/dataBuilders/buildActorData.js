import { getActorAddtionalStats, getSpecificAdditionalStat } from "../foundryActions.js";
import * as global from "../global.js";
import { SpecialAbilitiesForDescription } from "./buildActorItemsSpecialAbilities.js"
import { additionalStatsBuilder } from "./itemBuilder.js";

export const BuildActorData = async function (parsedData, isWildCard) {
    var data = {};

    data.attributes = generateAttributes(parsedData),
        data.stats = {
            speed: {
                runningDie: findRunningDie(parsedData['Special Abilities']),
                value: parsedData.Pace
            },
            toughness: {
                value: parsedData.Toughness
            },
            parry: { value: parsedData.Parry },
            size: parsedData.Size
        }
    data.details = {
        biography: {
            value: buildBioAndSpecialAbilities(parsedData)
        },
        autoCalcToughness: true
    }
    data.powerPoints = {
        value: parsedData['Power Points'],
        max: parsedData['Power Points']
    }
    data.wounds = {
        max: calculateWoundMod(parsedData.Size, isWildCard),
        ignored: calculateIgnoredWounds(parsedData)
    }
    data.initiative = initiativeMod(parsedData.Edges);
    data.wildcard = isWildCard;
    data.additionalStats = await buildAdditionalStats(parsedData)

    return data;
}

function generateAttributes(parsedData) {
    let attributesData = parsedData.Attributes;

    if (parsedData.Attributes.animalSmarts == true) {
        attributesData.smarts.animal = true;
    }

    let unShakeBonus = findUnshakeBonus(parsedData);
    if (unShakeBonus != undefined) {
        attributesData.spirit.unShakeBonus = unShakeBonus;
    }

    return attributesData;
}

function buildBioAndSpecialAbilities(parsedData) {
    if (parsedData['Special Abilities'] != undefined) {
        let specialAbsHtml = SpecialAbilitiesForDescription(parsedData['Special Abilities'])
        return parsedData.Biography.value.concat(specialAbsHtml);
    }
    return parsedData.Biography.value;    
}

async function buildAdditionalStats(parsedData) {
    let additionalStats = {};
    let actorSystemStats = getActorAddtionalStats();
    actorSystemStats.forEach(element => {
        let statName = element.replace(':', '');
        let statValue = parsedData[statName];
        if (statValue !== undefined) {
            additionalStats[statName] = additionalStatsBuilder(statName, statValue)
        }
    });
    return additionalStats;
}

function calculateWoundMod(size, isWildCard) {
    var baseWounds = isWildCard ? 3 : 1;
    if (size >= 4 && size <= 7) {
        baseWounds += 1;
    }
    if (size >= 8 && size <= 11) {
        baseWounds += 2;
    }
    if (size >= 12) {
        baseWounds += 3;
    }

    return baseWounds;
}

function initiativeMod(edges) {
    if (edges != undefined) {
        let hasHesitant = false;
        let hasLevelHeaded = false;
        let hasImpLevelHeaded = false;
        edges.forEach(element => {
            if (element.includes("Hesitant")) {
                hasHesitant = true;
            }
            if (element.includes("Level Headed")) {
                hasLevelHeaded = true;
            }
            if (element.includes("Level Headed (Imp)")) {
                hasImpLevelHeaded = true;
            }
        });

        return {
            "hasHesitant": hasHesitant,
            "hasLevelHeaded": hasLevelHeaded,
            "hasImpLevelHeaded": hasImpLevelHeaded
        }
    }
}

function findRunningDie(abilities) {
    for (const ability in abilities) {
        if (ability.toLowerCase().includes("speed")) {
            return parseInt(abilities[ability].match(global.diceRegex)[0].replace('d', ''))
        }
    }
}

function calculateIgnoredWounds(parsedData) {
    let bonusTotal = 0;
    for (const ability in parsedData['Special Abilities']) {
        if (global.IgnoreWound.includes((ability.toLowerCase()))) {
            bonusTotal += 1;
        }
    }
    return bonusTotal;
}

function findUnshakeBonus(parsedData) {
    let bonusTotal = 0;
    for (const ability in parsedData['Special Abilities']) {
        if (global.UnshakeBonus.includes((ability.toLowerCase()))) {
            bonusTotal += 2;
        }
    }

    if (parsedData.Edges != undefined) {
        parsedData.Edges.forEach(edge => {
            if (global.UnshakeBonus.includes((edge.toLowerCase()))) {
                bonusTotal += 2;
            }
        });
    }


    return bonusTotal;
}