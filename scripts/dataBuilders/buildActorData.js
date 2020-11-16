import * as global from "../global.js";
import { SpecialAbilitiesForDescription } from "./buildActorItemsSpecialAbilities.js"

export const BuildActorData = async function (parsedData, isWildCard) {
    var data = {};

    data.attributes = GenerateAttributes(parsedData),
        data.stats = {
            speed: {
                runningDie: FindRunningDie(parsedData['Special Abilities']),
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
            value: BuildBioAndSpecialAbilities(parsedData)
        },
        autoCalcToughness: true
    }
    data.powerPoints = {
        value: parsedData['Power Points'],
        max: parsedData['Power Points']
    }
    data.wounds = {
        max: CalculateWoundMod(parsedData.Size, isWildCard),
        ignored: CalculateIgnoredWounds(parsedData)
    }
    data.initiative = InitiativeMod(parsedData.Edges);
    data.additionalStats = getAdditionalStats(parsedData);
    data.wildcard = isWildCard;

    return data;
}

function GenerateAttributes(parsedData) {
    let attributesData = parsedData.Attributes;

    if (parsedData.Attributes.animalSmarts == true) {
        attributesData.smarts.animal = true;
    }

    let unShakeBonus = FindUnshakeBonus(parsedData);
    if (unShakeBonus != undefined) {
        attributesData.spirit.unShakeBonus = unShakeBonus;
    }

    return attributesData;
}

function BuildBioAndSpecialAbilities(parsedData) {
    return parsedData.Biography.value.concat(SpecialAbilitiesForDescription(parsedData['Special Abilities']));
}

function getAdditionalStats(parsedData){
    
}

function CalculateWoundMod(size, isWildCard) {
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

function InitiativeMod(edges) {
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

function FindRunningDie(abilities) {
    for (const ability in abilities) {
        if (ability.toLowerCase().includes("speed")) {
            return parseInt(abilities[ability].match(global.diceRegex)[0].replace('d', ''))
        }
    }
}

function CalculateIgnoredWounds(parsedData) {
    let bonusTotal = 0;
    for (const ability in parsedData['Special Abilities']) {
        if (global.IgnoreWound.includes((ability.toLowerCase()))) {
            bonusTotal += 1;
        }
    }
    return bonusTotal;
}

function FindUnshakeBonus(parsedData) {
    let bonusTotal = 0;
    for (const ability in parsedData['Special Abilities']) {
        if (global.UnshakeBonus.includes((ability.toLowerCase()))) {
            bonusTotal += 2;
        }
    }

    parsedData.Edges.forEach(edge => {
        if (global.UnshakeBonus.includes((edge.toLowerCase()))) {
            bonusTotal += 2;
        }
    })

    return bonusTotal;
}