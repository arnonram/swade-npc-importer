import { log } from "./global.js"
import * as global from "./global.js"

export const StatBlockParser = function (inData) {
    var importedActor = {};
    log("Starting statblock parsing...")
    try {
        let sections = GetSections(inData);
        Object.assign(importedActor, GetNameAndDescription(sections));
        Object.assign(importedActor, GetAttributes(sections));
        Object.assign(importedActor, GetSkills(sections));
        Object.assign(importedActor, GetBaseStats(sections), GetListsStats(sections), GetBulletListStats(sections));
        Object.assign(importedActor, GetGear(sections));
        importedActor.Size = GetSize(importedActor.SpecialAbilities);
        log(JSON.stringify(importedActor, null, 4))
    } catch (er) {
        ui.notifications.error(`Failed to prase: ${er}`)
    }

    return importedActor;
}



function GetSections(inData) {
    let indexes = GetSectionsIndex(inData);
    if (indexes.length === 0) {
        throw "Not a valid statblcok"
    }
    let sections = [];
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

function GetNameAndDescription(sections) {
    let nameDesc = {}
    let lines = sections[0].split(global.newLineRegex);
    nameDesc.Name = lines[0];
    lines.shift();
    nameDesc.Biography = {
        value: lines.join(" ")
    }
    sections.shift();
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
            sides: parseInt(traitDice.trim().replace('d', '')),
            modifier: parseInt(traitMod.trim())
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
        let line = sections.find(x => x.includes(element)).replace(global.newLineRegex, ' ').replace('.', '');
        line = line.split(':');
        listStats[line[0]] = line[1].split(',').map(s => s.trim());
    });
    return listStats;
}

function GetBulletListStats(sections) {
    let bulletListStats = {};
    global.supportedBulletListStats.forEach(bulletList => {
        let abilities = {}
        let line = SplitAndTrim(sections.find(x => x.includes(bulletList)), '•');
        line.shift();
        line.forEach(element => {
            let ability = element.split(':');
            abilities[ability[0].trim()] = ability[1].replace().trim();
        })
        bulletListStats[bulletList.slice(0, -1).replace(' ', '')] = abilities;
    });
    return bulletListStats;
}

function GetGear(sections) {
    let characterGear = []
    let gearLine = sections.find(x => x.includes("Gear:")).replace(global.newLineRegex, '').replace("Gear: ", '');
    let numberOfClosingParenthesis = gearLine.match(global.closingParenthesis || []).length;
    for (let i = 0; i < numberOfClosingParenthesis; i++) {
        let firstOpeningParenthesis = gearLine.indexOf('(');
        let firstClosingParenthesis = gearLine.indexOf(')');
        let firstComma = gearLine.indexOf(',');
        let gearSubstring = gearLine.substring(StartOfGearEntity(firstComma, firstOpeningParenthesis), firstClosingParenthesis + 1).trim();
        characterGear.push(CleanGearEntry(gearSubstring));
        gearLine = gearLine.replace(gearSubstring, '');
        gearLine = CleanGearEntry(gearLine);
    };
    let restOfGear = SplitAndTrim(gearLine, ",");
    characterGear = characterGear.concat(restOfGear)
    return { Gear: ParseGear(characterGear) };
}

function ParseGear(gearArray) {
    let gearDict = {}
    gearArray.forEach(gear => {
        let splitGear = gear.replace(')', '').split('(');
        if (splitGear.length === 2) {
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

function StartOfGearEntity(comma, firstParenthesis) {
    return comma < firstParenthesis ? comma : 0;
}

function SplitAndTrim(stringToSplit, separator) {
    return stringToSplit.split(separator).map(function (item) {
        return item.replace(global.newLineRegex, ' ').trim();
    });
}

function CleanGearEntry(gearLine) {
    if (gearLine.indexOf(', ') === 0) {
        gearLine = gearLine.slice(1).trim();
    }
    return gearLine.trim();
}

function GetSize(abilities) {
    for (const ability in abilities) {
        if (ability.toLowerCase().includes("size")){
            return parseInt(ability.split(" ")[1]);
        }
    }
}
