import { log } from "./global.js"
import * as global from "./global.js"
import * as itemBuilder from "./itemBuilder.js";
import { StatBlockParser } from "./parseStatBlock.js";
import { SpecialAbilitiesParser } from "./parseSpecialAbilities.js"

export const BuildActor = async function (clipboardText, actorType, isWildCard) {
    log(`BuildActor initiated: actorType=${actorType}, isWildCard=${isWildCard}`)
    if (clipboardText != undefined) {
        let parsedData = StatBlockParser(clipboardText);
        log(JSON.stringify(parsedData));
        var finalActor = {}
        finalActor.name = parsedData.Name;
        finalActor.type = actorType;
        finalActor.data = BuildActorData(parsedData, isWildCard);
        finalActor.items = BuildActorItems(parsedData);
        finalActor.token = BuildActorToken(parsedData);

        log(`Actor to import: ${JSON.stringify(finalActor)}`);
        ImportActor(JSON.stringify(finalActor))
    } else {
        ui.notification.error("Clipboard empty")
    }
}

function BuildActorData(parsedData, isWildCard) {
    var data = {};

    data.attributes = parsedData.Attributes,
        data.stats = {
            speed: {
                runningDie: FindRunningDie(parsedData.SpecialAbilities),
                value: parsedData.Pace
            },
            toughness: {
                value: parsedData.Toughness,
                armor: FindArmor(parsedData.SpecialAbilities)
            },
            parry: { value: parsedData.Parry },
            size: parsedData.Size
        }
    data.details = {
        biography: parsedData.Biography,
        autoCalcToughness: true
    }
    data.powerPoints = {
        value: parsedData['Power Points'],
        max: parsedData['Power Points']
    }
    data.wounds = {
        max: CalculateWoundMod(parsedData.Size, isWildCard)
    }
    data.initiative = InitiativeMod(parsedData.Edges);
    data.wildcard = isWildCard;

    return data;
}

function BuildActorItems(parsedData) {
    let items = [];
    items.push(itemBuilder.SkillBuilder(parsedData.skills))
    items.push(itemBuilder.EdgeBuilder(parsedData.Edges))
    items.push(itemBuilder.HindranceBuilder(parsedData.Hindrances))
    items.push(itemBuilder.PowerBuilder(parsedData.Powers))
    items.push(SpecialAbilitiesParser(parsedData.SpecialAbilities))

    return items;
}

function BuildActorToken(parsedData) {
    var token = {};
    const squares = GetWidthHight(parsedData.Size);

    token.width = squares;
    token.height = squares;
    token.scale = CalculateScale(parsedData.Size);
    token.vision = true

    return token;
}

function GetWidthHight(size) {
    switch (size) {
        case (size <= 2):
            return 1;
        case (size >= 3 && size <= 5):
            return 2
        case (size >= 6 && size <= 8):
            return 4
        case (size >= 9 && size <= 11):
            return 8
        case (size >= 12):
            return 16
    }
}

function CalculateWoundMod(size, isWildCard) {
    var baseWounds = isWildCard ? 3 : 1;
    switch (size) {
        case (size <= 7 && size >= 4):
            baseWounds = baseWounds + 1;
            break;
        case (size <= 8 && size >= 11):
            baseWounds = baseWounds + 2;
            break;
        case (size >= 12):
            baseWounds = baseWounds + 3;
            break;
    }
    return baseWounds;
}

function CalculateScale(size) {
    switch (size) {
        case (size >= 0):
            return 1;
        case (-1):
            return 0.85;
        case (-2 || -3):
            return 0.75;
        case (-4):
            return 0.5;
    }
}

function InitiativeMod(edges) {
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

function FindRunningDie(abilities) {
    for (const ability in abilities) {
        if (ability.toLowerCase().includes("speed")){
            return parseInt(abilities[ability].match(global.diceRegex)[0].replace('d', ''))
        }
    }
}

function FindArmor(abilities) {
    for (const ability in abilities) {
        if (ability.toLowerCase().includes("armor")){
            return ability.split(" ")[1].toString();
        }
    }
}