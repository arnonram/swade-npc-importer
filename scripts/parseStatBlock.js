import { log } from "./global.js";
import * as global from "./global.js";
import * as GetMeleeDamage from "./utils/parserBuilderHelpers.js";
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

        importedActor.Size = GetSize(importedActor["Special Abilities"]);
        log(`Prased data: ${JSON.stringify(importedActor, null, 4)}`)

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
    nameDesc.Name = capitalizeEveryWord(lines[0]);
    lines.shift();
    let bio = lines.join(" ").replace(global.newLineRegex, " ").trim();
    if (lines.length > 0) {
        nameDesc.Biography = {
            value: bio
        }
    }
    return nameDesc;
}

function GetAttributes(sections) {
    let trait = `${game.i18n.localize("npcImporter.parser.Attributes")}:`;
    let attributes = SplitAndTrim(sections.find(x => x.includes(trait)).replace(trait, ''), ',');
    let attributesDict = {};
    attributes.forEach(singleTrait => {
        if (singleTrait.includes('(A)')) {
            attributesDict['animalSmarts'] = true;
            singleTrait = singleTrait.replace('(A)', '')
        }

        let diceAndMode = [];
        if (global.diceRegex.test(singleTrait)) {
            diceAndMode = singleTrait.match(global.diceRegex)[0].toString();
            let traitName = singleTrait.replace(diceAndMode, '').trim().replace(' )', ')');
            let traitDice = diceAndMode.includes("+") ? diceAndMode.split("+")[0] : diceAndMode.split("-")[0];
            let traitMod = diceAndMode.includes("+")
                ? `+${diceAndMode.split("+")[1]}`
                : (diceAndMode.includes("-") ? `-${diceAndMode.split("-")[1]}` : "0");

            attributesDict[traitName.toLowerCase()] = {
                die: {
                    sides: parseInt(traitDice.trim().replace('d', '')),
                    modifier: parseInt(traitMod.trim())
                }
            }
        } else {
            diceAndMode = singleTrait.split(' ');
            attributesDict[diceAndMode[0].toLowerCase()] = {
                die: {
                    sides: parseInt(diceAndMode[1])
                }
            }
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
        let traitDice = diceAndMode.includes("+") ? diceAndMode.split("+")[0] : diceAndMode.split("-")[0];
        let traitMod = diceAndMode.includes("+")
            ? `+${diceAndMode.split("+")[1]}`
            : (diceAndMode.includes("-") ? `-${diceAndMode.split("-")[1]}` : "0");

        skillsDict[traitName.toLowerCase()] = {
            sides: parseInt(traitDice.trim().replace('d', '')),
            modifier: parseInt(traitMod.trim())
        }
    });
    return { Skills: skillsDict };
}

function GetBaseStats(sections) {
    let baseStats = [
        `${game.i18n.localize("npcImporter.parser.Pace")}:`,
        `${game.i18n.localize("npcImporter.parser.Parry")}:`,
        `${game.i18n.localize("npcImporter.parser.Toughness")}:`,
        `${game.i18n.localize("npcImporter.parser.PowerPoints")}:`
    ];

    let retrievedStats = {}
    baseStats.forEach(element => {
        let stat = sections.find(x => x.includes(element));
        if (stat != undefined) {
            stat = sections.find(x => x.includes(element)).split(':');
            retrievedStats[stat[0]] = parseInt(stat[1].replace(';', '').trim());
        }
    });
    return retrievedStats;
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
        if (line != undefined) {
            line = line.replace(global.newLineRegex, ' ').replace('.', '');
            line = line.split(':');
            if (line[1].match(new RegExp(/\w+/gi))) {
                retrievedListStats[line[0]] = line[1].split(',').map(s => s.trim());
            }
        }
    });
    return retrievedListStats;
}

function GetBulletListStats(sections) {
    const supportedBulletListStats = [
        `${game.i18n.localize("npcImporter.parser.SpecialAbilities")}:`,
        `${game.i18n.localize("npcImporter.parser.SuperPowers")}:`
    ];

    var retrievedBulletListStats = {};
    supportedBulletListStats.forEach(bulletList => {
        let abilities = {}
        var line = sections.find(x => x.includes(bulletList));
        if (line != undefined) {
            line = SplitAndTrim(line, new RegExp(getModuleSettings(global.settingBulletPointIcons), "ig"));
            line.shift();
            line.forEach(element => {
                let ability = element.split(':');
                abilities[ability[0].trim()] = ability.length == 2 ? ability[1].replace(global.newLineRegex, " ").trim() : ability[0];
            });
            retrievedBulletListStats[bulletList.replace(':', '')] = abilities;
        }
    });
    return retrievedBulletListStats;
}

async function GetGear(sections) {
    let gearString = `${game.i18n.localize("npcImporter.parser.Gear")}:`
    try {
        let characterGear = []
        let gearLine = sections.find(x => x.includes(gearString)).replace(global.newLineRegex, ' ').replace(`${gearString} `, '');
        while (gearLine.length > 0) {
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
            if (splitGear != '.') {
                gearDict[gear] = null;
            }
        }
        // parse weapon
        else if (global.meleeDamageRegex.test(splitGear[1])
            || splitGear[1].toLowerCase().includes('damage')
            || splitGear[1].toLowerCase().includes('range')) {
            gearDict[splitGear[0]] = weaponParser(splitGear[1].split(',').filter(n => n).map(function (x) { return x.trim() }));
        }
        // check if armor
        else if (global.armorModRegex.test(splitGear[1]) || splitGear[0].toLowerCase().includes(game.i18n.localize("npcImporter.parser.Armor"))) {
            gearDict[splitGear[0]] = { armorBonus: GetMeleeDamage.GetArmorBonus(splitGear[1]) }
        }
        // check if shield
        else if (parryRegex.test(splitGear[1]) || splitGear[0].toLowerCase().includes(game.i18n.localize("npcImporter.parser.Shield"))) {
            let parry = GetMeleeDamage.GetParryBonus(splitGear[1]);
            let cover = GetMeleeDamage.GetCoverBonus(splitGear[1]);
            gearDict[splitGear[0]] = { parry: parry, cover: cover }
        }
        // // parse weapon
        // else {
        //     gearDict[splitGear[0]] = weaponParser(splitGear[1].split(',').filter(n => n).map(function (x) { return x.trim() }));
        // }
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
            let statName = stat.match(new RegExp('^[A-Za-z]+'))[0];
            weaponStats[statName.toLowerCase().trim()] = stat.replace(statName, '').trim();
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
                    systemStats[stat[0]] = stat[1]
                } else if (element.dtype === "Number") {
                    systemStats[stat[0]] = parseInt(stat[1].replace(';', '').trim());
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
        if (ability.toLowerCase().includes(game.i18n.localize("npcImporter.parser.Size"))) {
            return parseInt(ability.split(" ")[1].replace('−', '-'));
        }
    }
    return 0;
}
