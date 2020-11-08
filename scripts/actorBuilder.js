import { log } from "./global.js"
import * as global from "./global.js"
import * as itemBuilder from "./itemBuilder.js";
import { StatBlockParser } from "./parseStatBlock.js";
import { SpecialAbilitiesForDescription, SpecialAbilitiesParser } from "./parseSpecialAbilities.js"
import { ActorImporter } from "./actorImporter.js";

export const BuildActor = async function (actorType, isWildCard, disposition, data) {
    log(`BuildActor initiated: actorType=${actorType}, isWildCard=${isWildCard}, disposition=${disposition}`)
    let clipboardText = data ?? await GetClipboardText();
    if (clipboardText != undefined) {
        let parsedData = StatBlockParser(clipboardText);
        if (parsedData != undefined) {
            var finalActor = {}
            finalActor.name = parsedData.Name;
            finalActor.type = actorType;
            finalActor.data = await BuildActorData(parsedData, isWildCard == 'true');
            finalActor.items = await BuildActorItems(parsedData);
            finalActor.token = await BuildActorToken(parsedData, disposition);

            log(`Actor to import: ${JSON.stringify(finalActor)}`);
            await ActorImporter(finalActor);
        }
    } else {
        ui.notification.error("Clipboard empty")
    }
}

async function GetClipboardText() {
    log("Reading clipboard data...");
    return await navigator.clipboard.readText();
}

async function BuildActorData(parsedData, isWildCard) {
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
    data.wildcard = isWildCard;

    return data;
}

async function BuildActorItems(parsedData) {
    let items = [];
    let skills = await itemBuilder.SkillBuilder(parsedData.Skills) ?? [];
    let edges = await itemBuilder.EdgeBuilder(parsedData.Edges) ?? [];
    let hindrances = await itemBuilder.HindranceBuilder(parsedData.Hindrances) ?? [];
    let powers = await itemBuilder.PowerBuilder(parsedData.Powers) ?? [];
    let specialAbilities = await SpecialAbilitiesParser(parsedData['Special Abilities']) ?? [];
    let gear = await ItemGearBuilder(parsedData.Gear);

    items = items.concat(skills, edges, hindrances, powers, specialAbilities, gear);
    log(`created items: ${items}`)
    return items;
}

async function BuildActorToken(parsedData, disposition) {
    var token = {};
    const squares = GetWidthHight(parsedData.Size);

    token.width = squares;
    token.height = squares;
    token.scale = CalculateScale(parsedData.Size);
    token.vision = true;
    token.dimSight = 10;
    token.disposition = disposition;
    return token;
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

function GetWidthHight(size) {
    if (size <= 2) {
        return 1;
    }
    if (size >= 3 && size <= 5) {
        return 2
    }
    if (size >= 6 && size <= 8) {
        return 4
    }
    if (size >= 9 && size <= 11) {
        return 8
    }
    if (size >= 12) {
        return 16
    }
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

function CalculateScale(size) {
    if (size >= 0) {
        return 1;
    }
    if (-1) {
        return 0.85;
    }
    if (-2 || -3) {
        return 0.75;
    }
    if (-4) {
        return 0.5;
    }
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

async function ItemGearBuilder(gear){
    let gearItems = [];
    for (const item in gear) {
        if (gear[item].includes(global.armorModRegex)){ //check for armor
            gearItems.push(await itemBuilder.ArmorBuilder(item, gear[item]));
        } else if (gear[item].includes(global.meleeDamageRegex)){ // check for melee weapons
            let meleeDamage = GetMeleeDamage(gear[item]);
            gearItems.push(await itemBuilder.WeaponBuilder(item, gear[item], meleeDamage));
        } else if (gear[item] == null) {
            gearItems.push(await itemBuilder.GearBuilder(gear))
        } else {
            gearItems.push(await itemBuilder
                .WeaponBuilder(item, gear[item], gear[item]['Damage'], gear[item]['Range'], gear[item]['RoF'], gear[item]['AP']))
        }


    }
}