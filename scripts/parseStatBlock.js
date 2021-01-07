import { log } from "./global.js";
import * as global from "./global.js";
import * as parserHelper from "./utils/parserBuilderHelpers.js";
import { capitalizeEveryWord } from "./utils/textUtils.js";
import { getModuleSettings, getActorAddtionalStatsArray, getActorAddtionalStats } from "./utils/foundryActions.js";


export const StatBlockParser = async function (clipData) {
    try {
        log(`Starting statblock parsing`);
        let sections = GetSections(clipData);
        var importedActor = {};
        Object.assign(importedActor, GetNameAndDescription(sections[0]));
        Object.assign(importedActor, GetAttributes(sections));
        Object.assign(importedActor, GetSkills(sections));
        Object.assign(importedActor, GetBaseStats(sections));
        Object.assign(importedActor, GetListsStats(sections));
        Object.assign(importedActor, GetBulletListStats(sections));
        Object.assign(importedActor, await GetGear(sections));
        Object.assign(importedActor, getSystemDefinedStats(sections));

        importedActor.Size = GetSize(importedActor.SpecialAbilities);
        log(`Prased data: ${JSON.stringify(importedActor, null, 4)}`);
        return importedActor;
    } catch (error) {
        log(`Failed to prase: ${error}`);
        ui.notifications.error(game.i18n.localize("npcImporter.parser.NotValidStablock"))
    }
}

function GetSections(inData) {
    let indexes = GetSectionsIndex(inData);
    if (indexes.length === 0) {
        throw "Not a valid statblcok"
    }
    var sections = [];
    for (let i = 0; i < indexes.length; i++) {
        if (i === 0) {
            sections.push(inData.substring(0, indexes[i]).trim())
        }
        if (i === indexes.length - 1) {
            sections.push(inData.substring(indexes[i]).trim())
        }
        else {
            sections.push(inData.substring(indexes[i], indexes[i + 1]).trim())
        }
    }
    return sections;
}

function GetSectionsIndex(inData) {
    const allStatBlockEntities = [
        `${game.i18n.localize("npcImporter.parser.Attributes")}:`,
        `${game.i18n.localize("npcImporter.parser.Skills")}:`,
        `${game.i18n.localize("npcImporter.parser.Hindrances")}:`,
        `${game.i18n.localize("npcImporter.parser.Edges")}:`,
        `${game.i18n.localize("npcImporter.parser.Powers")}:`,
        `${game.i18n.localize("npcImporter.parser.Pace")}:`,
        `${game.i18n.localize("npcImporter.parser.Parry")}:`,
        `${game.i18n.localize("npcImporter.parser.Toughness")}:`,
        `${game.i18n.localize("npcImporter.parser.PowerPoints")}:`,
        `${game.i18n.localize("npcImporter.parser.Gear")}:`,
        `${game.i18n.localize("npcImporter.parser.SpecialAbilities")}:`,
        `${game.i18n.localize("npcImporter.parser.SuperPowers")}:`
    ];

    let allStats = allStatBlockEntities.concat(getActorAddtionalStatsArray());
    let sectionsIndex = [];
    allStats.forEach(element => {
        let index = inData.indexOf(element);
        if (index > 0) {
            sectionsIndex.push(index);
        }
    });
    return sectionsIndex.sort(function (a, b) {
        return a - b;
    });
}

function GetNameAndDescription(nameAndDescription) {
    let nameDesc = {}
    let lines = nameAndDescription.split(global.newLineRegex);
    nameDesc.Name = capitalizeEveryWord(lines[0].trim());
    lines.shift();
    let bio = descriptionByParagraph(lines);
    nameDesc.Biography = {
        value: bio
    }

    return nameDesc;
}

function descriptionByParagraph(descArray) {
    let bio = '';
    descArray.forEach(line => {
        if (line.endsWith('.')) {
            line = line + '<br/>'
        }
        bio += line;
    })
    return bio;
}

function GetAttributes(sections) {
    let attrTranslation = `${game.i18n.localize("npcImporter.parser.Attributes")}:`;
    let attributes = SplitAndTrim(sections.find(x => x.includes(attrTranslation)).replace(attrTranslation, ''), ',');
    let attributesDict = {};

    attributes.forEach(singleTrait => {
        if (singleTrait.startsWith(game.i18n.localize("npcImporter.parser.Agility"))) {
            attributesDict.agility = buildTrait(singleTrait.replace(game.i18n.localize("npcImporter.parser.Agility")).trim());
        } else if (singleTrait.startsWith(game.i18n.localize("npcImporter.parser.Smarts"))) {
            let animal = false;
            if (singleTrait.includes('(A)')) {
                animal = true;
                singleTrait = singleTrait.replace('(A)', '')
            }
            attributesDict.smarts = buildTrait(singleTrait.replace(game.i18n.localize("npcImporter.parser.Smarts")).trim());
            if (animal) {
                attributesDict.smarts.animal = animal;
            }
        } else if (singleTrait.startsWith(game.i18n.localize("npcImporter.parser.Spirit"))) {
            attributesDict.spirit = buildTrait(singleTrait.replace("npcImporter.parser.Spirit").trim());
        } else if (singleTrait.startsWith(game.i18n.localize("npcImporter.parser.Strength"))) {
            attributesDict.strength = buildTrait(singleTrait.replace("npcImporter.parser.Strength").trim());
        } else if (singleTrait.startsWith(game.i18n.localize("npcImporter.parser.Vigor"))) {
            attributesDict.vigor = buildTrait(singleTrait.replace("npcImporter.parser.Vigor").trim());
        }
    });
    return { Attributes: attributesDict };
}

function GetSkills(sections) {
    let trait = `${game.i18n.localize("npcImporter.parser.Skills")}:`;
    let skills = SplitAndTrim(sections.find(x => x.includes(trait)).replace(trait, ''), ',');
    let skillsDict = {};
    skills.forEach(singleTrait => {
        let diceAndMode = singleTrait.match(global.diceRegex)[0].toString();
        let traitName = singleTrait.replace(diceAndMode, '').trim().replace(' )', ')');
        skillsDict[traitName.toLowerCase().replace(':', '')] = buildTrait(diceAndMode);
    });
    return { Skills: skillsDict };
}

function buildTrait(data) {
    let diceAndMode = '';
    try {
        diceAndMode = data.match(global.diceRegex)[0].toString();
    } catch (error) {
        diceAndMode = '1' // usually will be 1, if not then we'll need to think about it.
    }

    let traitDice = diceAndMode.includes("+") ? diceAndMode.split("+")[0] : diceAndMode.split("-")[0];
    let traitMod = diceAndMode.includes("+")
        ? `+${diceAndMode.split("+")[1]}`
        : (diceAndMode.includes("-") ? `-${diceAndMode.split("-")[1]}` : "0");

    return {
        die: {
            sides: parseInt(traitDice.trim().replace('d', '')),
            modifier: parseInt(traitMod.trim())
        }
    }
}

function GetBaseStats(sections) {
    let baseStats = [
        `${game.i18n.localize("npcImporter.parser.Pace")}:`,
        `${game.i18n.localize("npcImporter.parser.Parry")}:`,
        `${game.i18n.localize("npcImporter.parser.Toughness")}:`,
        `${game.i18n.localize("npcImporter.parser.PowerPoints")}:`
    ];

    let retrievedStats = {}
    baseStats.forEach(stat => {
        let data = sections.find(x => x.includes(stat));
        if (data != undefined && data.startsWith(game.i18n.localize("npcImporter.parser.Pace"))) {
            retrievedStats.Pace = getStatNumber(data);
        } else if (data != undefined && data.startsWith(game.i18n.localize("npcImporter.parser.Parry"))) {
            retrievedStats.Parry = getStatNumber(data);
        } else if (data != undefined && data.startsWith(game.i18n.localize("npcImporter.parser.Toughness"))) {
            retrievedStats.Toughness = getStatNumber(data);
        } else if (data != undefined && data.startsWith(game.i18n.localize("npcImporter.parser.PowerPoints"))) {
            retrievedStats.PowerPoints = getStatNumber(data);
        }
    });
    return retrievedStats;
}

function getStatNumber(data) {
    return parseInt(data.split(':')[1].replace(';', '').trim());
}

function GetListsStats(sections) {
    const supportedListStats = [
        `${game.i18n.localize("npcImporter.parser.Hindrances")}:`,
        `${game.i18n.localize("npcImporter.parser.Edges")}:`,
        `${game.i18n.localize("npcImporter.parser.Powers")}:`
    ];

    let retrievedListStats = {};
    supportedListStats.forEach(element => {
        var line = sections.find(x => x.includes(element));
        if (line != undefined && line.startsWith(game.i18n.localize("npcImporter.parser.Hindrances"))) {
            retrievedListStats.Hindrances = stringsToArray(line);
        } else if (line != undefined && line.startsWith(game.i18n.localize("npcImporter.parser.Edges"))) {
            retrievedListStats.Edges = stringsToArray(line);
        } else if (line != undefined && line.startsWith(game.i18n.localize("npcImporter.parser.Powers"))) {
            retrievedListStats.Powers = stringsToArray(line);
        }
    });
    return retrievedListStats;
}

function stringsToArray(line) {
    let data = line.replace(global.newLineRegex, ' ').replace('.', '').split(':')[1];
    return data.match(new RegExp(/[\w ]+(\()?([\w ,]+)?(\))?/gi));
}

function GetBulletListStats(sections) {
    const supportedBulletListStats = [
        `${game.i18n.localize("npcImporter.parser.SpecialAbilities")}:`,
        `${game.i18n.localize("npcImporter.parser.SuperPowers")}:`
    ];

    var retrievedBulletListStats = {};
    supportedBulletListStats.forEach(bulletList => {
        var line = sections.find(x => x.includes(bulletList));
        if (line != undefined && line.startsWith(game.i18n.localize("npcImporter.parser.SpecialAbilities"))) {
            retrievedBulletListStats.SpecialAbilities = getAbilities(line.replace(`${game.i18n.localize("npcImporter.parser.SpecialAbilities")}:`, '').trim());
        } else if (line != undefined && line.startsWith(game.i18n.localize("npcImporter.parser.SuperPowers"))) {
            retrievedBulletListStats.SuperPowers = getAbilities(line.replace(`${game.i18n.localize("npcImporter.parser.SuperPowers")}:`).trim());
        }
    });
    return retrievedBulletListStats;
}

function getAbilities(data) {
    const modifiedSpecialAbs = getModuleSettings(global.settingModifiedSpecialAbs);
    let abilities = {}
    let line = ''
    if (!modifiedSpecialAbs) {
        line = SplitAndTrim(data, new RegExp(getModuleSettings(global.settingBulletPointIcons), "ig"));
    } else {
        line = SplitAndTrim(data, new RegExp('@', 'gi'))
    }

    line.shift();
    line.forEach(element => {
        let ability = element.split(':');
        let abilityName = !modifiedSpecialAbs ? ability[0].trim() : `@${ability[0].trim()}`;
        abilities[abilityName] = ability.length == 2 ? ability[1].replace(global.newLineRegex, " ").trim() : ability[0];
    });

    return abilities;
}

async function GetGear(sections) {
    let gearString = `${game.i18n.localize("npcImporter.parser.Gear")}:`
    try {
        let characterGear = []
        let gearLine = sections.find(x => x.includes(gearString)).replace(global.newLineRegex, ' ').replace(`${gearString} `, '');
        while (gearLine.length > 1) {
            if (global.gearParsingRegex.test(gearLine)) {
                let match = gearLine.match(global.gearParsingRegex)[0];
                characterGear.push(match.trim());
                gearLine = gearLine.replace(match, '');
            } else {
                characterGear.push(gearLine.trim());
                break;
            }
        }

        return { Gear: await ParseGear(characterGear) };
    } catch { }
}

async function ParseGear(gearArray) {
    let parryRegex = new RegExp(`(\\+\\+d|\\-\\d+) ${game.i18n.localize("npcImporter.parser.Parry")}`);

    let gearDict = {};
    gearArray.forEach(async (gear) => {
        let splitGear = gear.replace(')', '').split('(');

        // normal gear
        if (splitGear.length == 1) {
            let normalGear = splitGear[0];
            if (normalGear != '.') {
                if (normalGear.slice(-1) == ',' || normalGear.slice(-1) == '.') {
                    normalGear = normalGear.replace(',', '').replace('.', '');
                }

                gearDict[normalGear.trim()] = null;
            }
        }
        // parse weapon
        else if (
            splitGear[1].includes(game.i18n.localize("npcImporter.parser.Str"))
            || splitGear[1].toLowerCase().includes('damage')
            || splitGear[1].toLowerCase().includes('range')) {
            gearDict[splitGear[0].trim()] = weaponParser(splitGear[1].split(',').filter(n => n).map(function (x) { return x.trim() }));
        }
        // check if armor
        else if (global.armorModRegex.test(splitGear[1]) || splitGear[0].toLowerCase().includes(game.i18n.localize("npcImporter.parser.Armor"))) {
            gearDict[splitGear[0].trim()] = { armorBonus: parserHelper.GetArmorBonus(splitGear[1]) }
        }
        // check if shield
        else if (parryRegex.test(splitGear[1]) || splitGear[0].toLowerCase().includes(game.i18n.localize("npcImporter.parser.Shield").toLowerCase())) {
            let parry = parserHelper.GetParryBonus(splitGear[1]);
            let cover = parserHelper.GetCoverBonus(splitGear[1]);
            gearDict[splitGear[0].trim()] = { parry: parry, cover: cover }
        }
    });
    return gearDict;
}

function weaponParser(weapon) {
    let weaponStats = {};
    log(weapon)
    weapon.forEach(stat => {
        log(stat)
        if (new RegExp('^Str', 'i').test(stat)) {
            weaponStats.damage = stat;
        } else {
            if (stat.includes(game.i18n.localize("npcImporter.parser.Shots").toLowerCase())){
                weaponStats["Shots"] = stat.replace("Shots", '').trim();    
            } else {
                let statName = stat.match(new RegExp('^[A-Za-z]+'))[0];
                weaponStats[statName.toLowerCase().trim()] = stat.replace(statName, '').trim();
            }
        }
    });
    return weaponStats;
}

function getSystemDefinedStats(sections) {
    let additionalStats = getActorAddtionalStats();
    let systemStats = {};
    for (const key in additionalStats) {
        if (additionalStats.hasOwnProperty(key)) {
            const element = additionalStats[key];
            let stat = sections.find(x => x.startsWith(element.label));
            if (stat != undefined) {
                stat = stat.replace(global.newLineRegex, ' ');
                stat = stat.split(':');
                if (element.dtype === "String") {
                    systemStats[stat[0]] = stat[1].replace(';', '').trim();
                } else if (element.dtype === "Number") {
                    systemStats[stat[0]] = parseInt(stat[1].replace(';', '').trim().replace('–', '-'));
                } else if (element.dtype === "Boolean") {
                    systemStats[stat[0]] = stat[1].replace(';', '').trim() == "true";
                }
            }
        }
    }
    return systemStats;
}

function SplitAndTrim(stringToSplit, separator) {
    return stringToSplit.split(separator).map(function (item) {
        return item.replace(global.newLineRegex, ' ').trim();
    });
}

function GetSize(abilities) {
    for (const ability in abilities) {
        if (ability.toLowerCase().includes(game.i18n.localize("npcImporter.parser.Size").toLowerCase())) {
            return parseInt(ability.replace(new RegExp('@([aehw])?'), '').trim().split(" ")[1].replace('−', '-'));
        }
    }
    return 0;
}
