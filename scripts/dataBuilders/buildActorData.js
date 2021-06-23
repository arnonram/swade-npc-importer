import { getActorAddtionalStatsArray, getModuleSettings } from "../utils/foundryActions.js";
import * as global from "../global.js";
import { additionalStatsBuilder } from "./itemBuilder.js";

export const BuildActorData = async function (parsedData, isWildCard, actorType) {
    var data = {};

    data.attributes = generateAttributes(parsedData),
        data.stats = {
            speed: {
                runningDie: findRunningDie(parsedData),
                runningMod: findRunningMod(parsedData),
                value: parsedData.Pace
            },
            toughness: {
                value: parsedData.Toughness,
                modifier: toughnessBonus(parsedData)
            },
            parry: { value: parsedData.Parry },
            size: parsedData.Size
        }
    data.details = {
        biography: parsedData.Biography,
        autoCalcToughness: getModuleSettings(global.settingAutoCalcToughness)
    }
    data.powerPoints = {
        value: parsedData.PowerPoints,
        max: parsedData.PowerPoints
    }
    data.wounds = {
        max: calculateWoundMod(parsedData.Size, isWildCard, parsedData.SpecialAbilities),
        ignored: calculateIgnoredWounds(parsedData)
    }
    data.initiative = initiativeMod(parsedData);
    data.wildcard = isWildCard;
    data.additionalStats = await buildAdditionalStats(parsedData)
    data.bennies = calculateBennies(isWildCard, actorType)
    return data;
}

function generateAttributes(parsedData) {
    let attributesData = parsedData.Attributes;

    let unShakeBonus = findUnshakeBonus(parsedData);
    if (unShakeBonus != undefined) {
        attributesData.spirit.unShakeBonus = unShakeBonus;
    }

    delete attributesData.animalSmarts;
    return attributesData;
}

async function buildAdditionalStats(parsedData) {
    let additionalStats = {};
    let actorSystemStats = getActorAddtionalStatsArray();
    actorSystemStats.forEach(element => {
        let statName = element.replace(':', '');
        let statValue = parsedData[statName];
        if (statValue !== undefined) {
            additionalStats[statName] = additionalStatsBuilder(statName, statValue)
        }
    });
    return additionalStats;
}

function calculateBennies(isWildCard, actorType) {
    let numOfBennies = 0;
    if (isWildCard && actorType === 'npc') {
        numOfBennies = 2;
    } else if (isWildCard && actorType === 'character') {
        numOfBennies = 3;
    }

    return {
        value: numOfBennies,
        max: numOfBennies
    }
}

function calculateWoundMod(size, isWildCard, specialAbs) {
    var baseWounds = isWildCard ? 3 : 0;
    if (getModuleSettings(global.settingCalculateAdditionalWounds)) {
        if (size >= 4 && size <= 7) {
            baseWounds += 1;
        }
        if (size >= 8 && size <= 11) {
            baseWounds += 2;
        }
        if (size >= 12) {
            baseWounds += 3;
        }

        for (const ability in specialAbs) {
            if (`${game.i18n.localize("npcImporter.parser.Resilient")}`.includes((ability.replace(new RegExp('^@([aehw]|sa)'), '').toLowerCase()).trim())) {
                bonusTotal += 1;
            } else if (`${game.i18n.localize("npcImporter.parser.VeryResilient")}`.includes((ability.replace(new RegExp('^@([aehw]|sa)'), '').toLowerCase()).trim())) {
                bonusTotal += 2;
            }
        }
        return baseWounds;
    }
    return baseWounds;
}

function initiativeMod(parsedData) {
    let hasHesitant = false;
    let hasLevelHeaded = false;
    let hasImpLevelHeaded = false;

    if (parsedData.Edges != undefined) {
        parsedData.Edges.forEach(element => {
            if (element.includes(game.i18n.localize("npcImporter.parser.LevelHeaded"))) {
                hasLevelHeaded = true;
            }
            if (element.includes(game.i18n.localize("npcImporter.parser.LevelHeadedImp"))) {
                hasImpLevelHeaded = true;
            }
        });
    }
    if (parsedData.Hindrances != undefined) {
        parsedData.Hindrances.forEach(element => {
            if (element.includes(game.i18n.localize("npcImporter.parser.Hesitant"))) {
                hasHesitant = true;
            }
        });

        return {
            "hasHesitant": hasHesitant,
            "hasLevelHeaded": hasLevelHeaded,
            "hasImpLevelHeaded": hasImpLevelHeaded
        }
    }
}

function findRunningDie(parsedData) {
    let runningDie = 6;

    try {
        for (const ability in parsedData.SpecialAbilities) {
            if (ability.toLowerCase().includes(game.i18n.localize("npcImporter.parser.Speed").toLowerCase())) {
                return parseInt(parsedData.SpecialAbilities[ability].match(global.diceRegex)[0].replace('d', ''))
            }
        }
        parsedData.Edges.forEach(edge => {
            if (edge.toLowerCase().includes(game.i18n.localize("npcImporter.parser.FleetFooted").toLowerCase())) {
                runningDie += 2
            }
        });
    } catch (error) {

    }

    return runningDie;
}

function findRunningMod(parsedData) {
    try {
        let runningMode = 0;
        parsedData.Edges.forEach(edge => {
            if (edge.toLowerCase().includes(game.i18n.localize("npcImporter.parser.FleetFooted").toLowerCase())) {
                runningMode += 2
            }
        });
        return runningMode;
    } catch (error) {

    }
}

function calculateIgnoredWounds(parsedData) {
    let bonusTotal = 0;
    if (getModuleSettings(global.settingCalculateIgnoredWounds)) {
        const ignoreWound = [
            game.i18n.localize("npcImporter.parser.Undead"),
            game.i18n.localize("npcImporter.parser.Construct"),
            game.i18n.localize("npcImporter.parser.Elemental")
        ];

        for (const ability in parsedData.SpecialAbilities) {
            if (ignoreWound.includes((ability.replace(new RegExp('^@([aehw]|sa)'), '').toLowerCase()).trim())) {
                bonusTotal += 1;
            }
        }
    }
    return bonusTotal;
}

function findUnshakeBonus(parsedData) {
    const unshakeBonus = [
        game.i18n.localize("npcImporter.parser.Undead"),
        game.i18n.localize("npcImporter.parser.Construct"),
        game.i18n.localize("npcImporter.parser.CombatReflexes")
    ];

    let bonusTotal = 0;
    for (const ability in parsedData.SpecialAbilities) {
        if (unshakeBonus.includes((ability.replace(new RegExp('^@([aehw]|sa)'), '').toLowerCase()).trim())) {
            bonusTotal += 2;
        }
    }

    if (parsedData.Edges != undefined) {
        parsedData.Edges.forEach(edge => {
            if (unshakeBonus.includes((edge.toLowerCase()))) {
                bonusTotal += 2;
            }
        });
    }

    return bonusTotal;
}

function toughnessBonus(parsedData) {
    const toughnessBonus = [
        game.i18n.localize("npcImporter.parser.Undead"),
        game.i18n.localize("npcImporter.parser.Brawny"),
        game.i18n.localize("npcImporter.parser.Brawler"),
        game.i18n.localize("npcImporter.parser.Bruiser"),

    ];
    let bonusTotal = 0;
    for (const ability in parsedData.SpecialAbilities) {
        if (toughnessBonus.includes((ability.replace(new RegExp('^@([aehw]|sa)'), '').toLowerCase()).trim())) {
            bonusTotal += 2;
        }
    }

    if (parsedData.Edges != undefined) {
        parsedData.Edges.forEach(edge => {
            if (toughnessBonus.includes((edge.toLowerCase()))) {
                bonusTotal += 1;
            }
        });
    }

    return bonusTotal;
}