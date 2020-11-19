import { log } from "./global.js";
import * as global from "./global.js";
import { getModuleSettings } from "./foundryActions.js";

export const StatBlockParser = function (clipData) {
    const additionalStats = game.settings.get(global.thisModule, global.settingDefaultDisposition);
    let allStats = global.allStatBlockEntities.concat(additionalStats);

    try {
        log(`Starting statblock parsing For data:\n ${clipData}`);
        let sections = GetSections(clipData, allStats);
        var importedActor = {};
        Object.assign(importedActor, GetNameAndDescription(sections[0]));
        Object.assign(importedActor, GetAttributes(sections));
        Object.assign(importedActor, GetSkills(sections));
        Object.assign(importedActor, GetBaseStats(sections));
        Object.assign(importedActor, GetListsStats(sections));
        Object.assign(importedActor, GetBulletListStats(sections));
        Object.assign(importedActor, GetGear(sections));
        importedActor.Size = GetSize(importedActor["Special Abilities"]);
        log(`Prased data: ${JSON.stringify(importedActor, null, 4)}`)

        return importedActor;
    } catch (error) {
        log(`Failed to prase: ${error}`);
        ui.notifications.error(`Failed to prase (see console for error)`)
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
    let sectionsIndex = [];
    global.allStatBlockEntities.forEach(element => {
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
    nameDesc.Name = lines[0];
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
    let trait = "Attributes:";
    let attributes = SplitAndTrim(sections.find(x => x.includes(trait)).replace(trait, ''), ',');
    let attributesDict = {};
    attributes.forEach(singleTrait => {
        if (singleTrait.includes('(A)')) {
            attributesDict['animalSmarts'] = true;
            singleTrait = singleTrait.replace('(A)', '')
        }
        let diceAndMode = singleTrait.match(global.diceRegex)[0].toString();

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
    });
    return { Attributes: attributesDict };
}

function GetSkills(sections) {
    let trait = "Skills:";
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
    let baseStats = {};
    global.baseStats.forEach(element => {
        let stat = sections.find(x => x.includes(element));
        if (stat != undefined) {
            stat = sections.find(x => x.includes(element)).split(':');
            baseStats[stat[0]] = parseInt(stat[1].replace(';', '').trim());
        }
    });
    return baseStats;
}

function GetListsStats(sections) {
    let listStats = {};
    global.supportedListStats.forEach(element => {
        var line = sections.find(x => x.includes(element));
        if (line != undefined) {
            line = line.replace(global.newLineRegex, ' ').replace('.', '');
            line = line.split(':');
            if (line[1].length > 1) {
                listStats[line[0]] = line[1].split(',').map(s => s.trim());
            }
        } else {
            log(`Actor has no ${element}`)
        }
    });
    return listStats;
}

function GetBulletListStats(sections) {
    var bulletListStats = {};
    global.supportedBulletListStats.forEach(bulletList => {
        let abilities = {}
        var line = sections.find(x => x.includes(bulletList));
        if (line != undefined) {
            line = SplitAndTrim(line, new RegExp(getModuleSettings(global.settingBulletPointIcons), "ig"));
            line.shift();
            line.forEach(element => {
                let ability = element.split(':');
                abilities[ability[0].trim()] = ability.length == 2 ? ability[1].replace(global.newLineRegex, " ").trim() : ability[0];
            });
            bulletListStats[bulletList.replace(':', '')] = abilities;
        } else {
            log(`Actor has no ${bulletList}`)
        }
    });
    return bulletListStats;
}

function GetGear(sections) {
    try {
        let characterGear = []
        let gearLine = sections.find(x => x.includes("Gear:")).replace(global.newLineRegex, ' ').replace("Gear: ", '');
        let numberOfClosingParenthesis = gearLine.match(global.closingParenthesis || []).length;
        for (let i = 0; i < numberOfClosingParenthesis; i++) {
            // let firstOpeningParenthesis = gearLine.indexOf('(');
            let firstClosingParenthesis = gearLine.indexOf(')');
            // let firstComma = gearLine.indexOf(',');
            let gearSubstring = gearLine.substring(0, firstClosingParenthesis + 1).trim();
            characterGear.push(CleanGearEntry(gearSubstring));
            gearLine = gearLine.replace(gearSubstring, '');
            gearLine = CleanGearEntry(gearLine);
        };
        if (gearLine.length > 0) {
            let restOfGear = SplitAndTrim(gearLine, ",");
            characterGear = characterGear.concat(restOfGear)
        }
        return { Gear: ParseGear(characterGear) };
    } catch (error) {
        log("Actor has no Gear")
    }
}

function ParseGear(gearArray) {
    let gearDict = {}
    gearArray.forEach(gear => {
        let splitGear = gear.replace(')', '').split('(');
        if (splitGear.length == 2) {
            gearDict[splitGear[0].trim()] = SplitAndTrim(splitGear[1], ',')
        } else {
            gearDict[gear] = null;
        }
    });
    return RangeWeaponMapping(gearDict);
}

function RangeWeaponMapping(gearDict) {
    let returnedDict = {};
    for (const [weaponName, weaponStats] of Object.entries(gearDict)) {
        if (weaponStats === null) {
            returnedDict[weaponName] = null;
        }
        else if (weaponStats.length === 1) {
            returnedDict[weaponName] = weaponStats.toString();
        }
        else {
            let weaponStatsDict = {};
            weaponStats.forEach(element => {
                let s = element.split(' ');
                weaponStatsDict[s[0]] = s[1];
            });
            returnedDict[weaponName] = weaponStatsDict;
        }
    }
    return returnedDict;
}

function SplitAndTrim(stringToSplit, separator) {
    return stringToSplit.split(separator).map(function (item) {
        return item.replace(global.newLineRegex, ' ').trim();
    });
}

function CleanGearEntry(gearLine) {
    if (gearLine.indexOf(',') == 0 || gearLine.indexOf('.') == 0) {
        gearLine = gearLine.slice(1).trim();
    }
    return gearLine.trim();
}

function GetSize(abilities) {
    for (const ability in abilities) {
        if (ability.toLowerCase().includes("size")) {
            log(ability);
            return parseInt(ability.split(" ")[1]);
        }
    }
    return 0;
}
