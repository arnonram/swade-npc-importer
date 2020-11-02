const statBlockParser = async function (charToImport) {
    const attributesAndSkills = ["Attributes:", "Skills:"];
    const supportedListStats = ["Hindrances:", "Edges:", "Powers:", "Gear:"];
    const baseStats = ["Pace:", "Parry:", "Toughness:", "Power Points:"]
    const additionalStats = ["Sanity:", "Conviction:", "Strain:"];
    const supportedBulletListStats = ["Special Abilities:", "Super Powers:"];
    const allStatBlockEntities = attributesAndSkills
        .concat(supportedListStats
            .concat(baseStats
                .concat(supportedBulletListStats
                    .concat(additionalStats))));

    const newLineRegex = /\r\n/gi;
    const diceRegex = /(\d+)?d(\d+)([\+\-]\d+)?/gi

    const inData = charToImport;
    let sections = [];
    var importedActor = {};

    function GetSections() {
        let indexes = GetSectionsIndex();
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

    function GetSectionsIndex() {
        let sectionsIndex = [];
        allStatBlockEntities.forEach(element => {
            let index = inData.indexOf(element);
            if (index > 0) {
                sectionsIndex.push(index);
            }
        });
        return sectionsIndex.sort(function (a, b) {
            return a - b;
        });
    }

    function GetNameAndDescription() {
        let lines = sections[0].split(newLineRegex);
        importedActor.name = lines[0];
        lines.shift();
        importedActor.biography = {
                value: lines.join(" ")
            }
        sections.shift();
    }

    function GetAttributes() {
        let trait = "Attributes:";
        let attributes = SplitAndTrim(sections.find(x => x.includes(trait)).replace(trait, ''), ',');
        let attributesDict = {};
        attributes.forEach(singleTrait => {
            if (singleTrait.includes('(A)')) {
                attributesDict['animalSmarts'] = true;
                singleTrait = singleTrait.replace('(A)', '')
            }
            let diceAndMode = singleTrait.match(diceRegex)[0].toString();

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
        importedActor[trait.slice(0, -1).toLowerCase()] = attributesDict;
    }

    function GetSkills() {
        let trait = "Skills:";
        let skills = SplitAndTrim(sections.find(x => x.includes(trait)).replace(trait, ''), ',');
        let skillsDict = {};
        skills.forEach(singleTrait => {
            let diceAndMode = singleTrait.match(diceRegex)[0].toString();

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
        importedActor[trait.slice(0, -1).toLowerCase()] = skillsDict;
    }

    function GetBaseStats() {
        baseStats.forEach(element => {
            let stat = sections.find(x => x.includes(element));
            if (stat != undefined) {
                stat = sections.find(x => x.includes(element)).split(':');
                importedActor[stat[0]] = parseInt(stat[1].replace(';', '').trim());
            }
        });
    }

    function GetListsStats(listsToget) {
        listsToget.forEach(element => {
            let line = sections.find(x => x.includes(element)).replace(newLineRegex, ' ').replace(`${element}: `, '').replace('.', '');
            importedActor[element] = line.split(',').map(s => s.trim());
        });
    }

    function GetBulletListStats() {
        supportedBulletListStats.forEach(bulletList => {
            let abilities = {}
            let line = SplitAndTrim(sections.find(x => x.includes(bulletList)), '•');
            line.shift();
            line.forEach(element => {
                let ability = element.split(':');
                abilities[ability[0].trim()] = ability[1].replace().trim();
            })
            importedActor[bulletList.slice(0, -1).replace(' ', '')] = abilities;
        });
    }

    function GetGear() {
        let characterGear = []
        let gearLine = sections.find(x => x.includes("Gear:")).replace(newLineRegex, '').replace("Gear: ", '');
        let numberOfClosingParenthesis = gearLine.match(/\)/g || []).length;
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
        importedActor.Gear = ParseGear(characterGear);
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
            return item.replace(newLineRegex, ' ').trim();
        });
    }

    function CleanGearEntry(gearLine) {
        if (gearLine.indexOf(', ') === 0) {
            gearLine = gearLine.slice(1).trim();
        }
        return gearLine.trim();
    }

    function GetSize() {
        var keys = Object.keys(importedActor.SpecialAbilities);
        keys.forEach(element => {
            if (element.toLowerCase().includes('size')) {
                importedActor.Size = element.split(" ")[1]
            }
        });
    }

    sections = GetSections();
    GetNameAndDescription();
    GetAttributes();
    GetSkills();
    GetBaseStats();
    GetListsStats(["Edges", "Hindrances", "Powers"]);
    GetBulletListStats();
    GetGear();
    GetSize();

    console.log(importedActor);
    return importedActor;
}
const fs = require('fs');
let charToImport = fs.readFileSync('../testData/testData.txt', 'utf8');
statBlockParser(charToImport)
