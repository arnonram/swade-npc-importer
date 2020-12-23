import { getActorAddtionalStatsArray, getModuleSettings } from "../utils/foundryActions.js";
import * as global from "../global.js";
import { SpecialAbilitiesForDescription } from "./buildActorItemsSpecialAbilities.js"
import { additionalStatsBuilder } from "./itemBuilder.js";

export const BuildActorData = async function (parsedData, isWildCard) {
    var data = {};

    data.attributes = generateAttributes(parsedData),
        data.stats = {
            speed: {
                runningDie: findRunningDie(parsedData),
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
        biography: {
            value: buildBioAndSpecialAbilities(parsedData)
        },
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
    data.initiative = initiativeMod(parsedData.Edges);
    data.wildcard = isWildCard;
    data.additionalStats = await buildAdditionalStats(parsedData)

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

function buildBioAndSpecialAbilities(parsedData) {
    let bio = parsedData.Biography?.value ?? '';

    if (parsedData.SpecialAbilities != undefined) {
        let specialAbsHtml = SpecialAbilitiesForDescription(parsedData.SpecialAbilities)
        return bio.concat(specialAbsHtml);
    }
    return bio;    
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

function calculateWoundMod(size, isWildCard, specialAbs) {
    var baseWounds = isWildCard ? 3 : 0;
    if (getModuleSettings(global.settingCalculateAdditionalWounds)){        
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
            if (`${game.i18n.localize("npcImporter.parser.Resilient")}`.includes((ability.replace(new RegExp('^@[aehw]'), '').toLowerCase()).trim())) {
                bonusTotal += 1;
            } else if (`${game.i18n.localize("npcImporter.parser.VeryResilient")}`.includes((ability.replace(new RegExp('^@[aehw]'), '').toLowerCase()).trim())) {
                bonusTotal += 2;
            }
        }
        return baseWounds;
    }
    return baseWounds;
}

function initiativeMod(edges) {
    if (edges != undefined) {
        let hasHesitant = false;
        let hasLevelHeaded = false;
        let hasImpLevelHeaded = false;
        edges.forEach(element => {
            if (element.includes(game.i18n.localize("npcImporter.parser.Hesitant"))) {
                hasHesitant = true;
            }
            if (element.includes(game.i18n.localize("npcImporter.parser.LevelHeaded"))) {
                hasLevelHeaded = true;
            }
            if (element.includes(game.i18n.localize("npcImporter.parser.LevelHeadedImp"))) {
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

function findRunningDie(parsedData) {
    let runningDie = 6;

    for (const ability in parsedData.SpecialAbilities) {
        if (ability.toLowerCase().includes(game.i18n.localize("npcImporter.parser.Speed").toLowerCase())) {
            runningDie = parseInt(parsedData[ability].match(global.diceRegex)[0].replace('d', ''))
        }
    }

    parsedData.Edges.forEach(edge => {
        if (edge.toLowerCase().includes(game.i18n.localize("npcImporter.parser.FleetFooted").toLowerCase())) {
            runningDie += 2
        }
    });
    
    return runningDie;
}

function calculateIgnoredWounds(parsedData) {
    let bonusTotal = 0;
    if (getModuleSettings(global.settingCalculateIgnoredWounds)){
        const ignoreWound = [
            game.i18n.localize("npcImporter.parser.Undead"),
            game.i18n.localize("npcImporter.parser.Construct"),
            game.i18n.localize("npcImporter.parser.Elemental")
        ];

        for (const ability in parsedData.SpecialAbilities) {
            if (ignoreWound.includes((ability.replace(new RegExp('^@[aehw]'), '').toLowerCase()).trim())) {
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
        if (unshakeBonus.includes((ability.replace(new RegExp('^@[aehw]'), '').toLowerCase()).trim())) {
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

function toughnessBonus(parsedData){
    const toughnessBonus = [
        game.i18n.localize("npcImporter.parser.Undead"),
        game.i18n.localize("npcImporter.parser.Brawny"),
        game.i18n.localize("npcImporter.parser.Brawler"),
        game.i18n.localize("npcImporter.parser.Bruiser"),

    ]; 
    let bonusTotal = 0;
    for (const ability in parsedData.SpecialAbilities) {
        if (toughnessBonus.includes((ability.replace(new RegExp('^@[aehw]'), '').toLowerCase()).trim())) {
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