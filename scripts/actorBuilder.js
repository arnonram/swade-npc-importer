
import { statBlockParser } from "./parserStatBlock"
import "./itemBuilder"
import { EdgeBuilder, HindranceBuilder, PowerBuilder, SkillBuilder } from "./itemBuilder";

export const BuildActor = async function (isPc, isWildCard) {
    let data = await navigator.clipboard.readText()
    let parsedData = await statBlockParser(data);

    var finalActor = {}
    finalActor.name = parsedData.name;
    finalActor.type = isPc;
    finalActor.data = BuildActorData(parsedData, isWildCard);
    finalActor.items = BuildActorItems(parsedData);
    finalActor.token = BuildActorToken(parsedData);

    importActor(JSON.stringify(finalActor))
}


function BuildActorData(parsedData, isWildCard) {
    var data = {};

    data.attributes = parsedData.attributes,
        data.stats = {
            speed: {
                runningDie: FindRunningDie(),
                value: parsedData.Pace
            },
            toughness: {
                value: parsedData.Toughness,
                armor: FindArmor(parsedData),
                modifier: 0
            },
            parry: { value: parsedData.Parry },
            size: parsedData.size
        }
    data.details = {
        biography: parsedData.biography,
        autoCalcToughness: true
    }
    data.powerPoints = {
        value: parsedData['Power Points'],
        max: parsedData['Power Points']
    }
    data.wounds = {
        max: (isWildCard ? 3 : 1) + CalculateWoundMod(actorData.Size)
    }
    data.initiative = InitiativeMod(actorData.Edges);
    data.wildcard = isWildCard;

    return data;
}

function BuildActorItems(parsedData) {
    let items = [];
    items.push(SkillBuilder(parsedData.skills))
    items.push(EdgeBuilder(parsedData.Edges))
    items.push(HindranceBuilder(parsedData.Hindrances))
    items.push(PowerBuilder(parsedData.Powers))

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

function CalculateWoundMod(size) {
    switch (size) {
        case (size <= 3):
            return 0;
        case (size <= 7 && size >= 4):
            return 1;
        case (size <= 8 && size >= 11):
            return 2;
        case (size >= 12):
            return 3;
    }
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

    return `{
        "hasHesitant": ${hasHesitant},
        "hasLevelHeaded": ${hasLevelHeaded},
        "hasImpLevelHeaded": ${hasImpLevelHeaded}
    }`
}

