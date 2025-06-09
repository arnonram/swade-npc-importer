import { log } from './global';
import * as global from './global';
import * as parserHelper from './utils/parserBuilderHelpers';
import { capitalizeEveryWord, splitAndTrim } from './utils/textUtils';
import {
  getModuleSettings,
  getActorAddtionalStatsArray,
  getActorAddtionalStats,
} from './utils/foundryActions';

export async function statBlockParser(clipData: string): Promise<any> {
  try {
    log(`Starting statblock parsing`);
    let sections = GetSections(clipData);
    var importedActor: any = {};
    Object.assign(importedActor, getNameAndDescription(clipData));
    Object.assign(importedActor, getAttributes(sections));
    Object.assign(importedActor, getSkills(sections));
    Object.assign(importedActor, getBaseStats(sections));
    Object.assign(importedActor, getListsStats(sections));
    Object.assign(importedActor, getBulletListStats(sections));
    Object.assign(importedActor, await getGear(sections));
    Object.assign(importedActor, getSystemDefinedStats(sections));
    importedActor.Biography.value = getConviction(
      sections,
      importedActor.Biography.value,
    );
    importedActor.Size = getSize(importedActor.SpecialAbilities);
    log(`Prased data: ${JSON.stringify(importedActor, null, 4)}`);
    return importedActor;
  } catch (error) {
    log(`Failed to prase: ${error}`);
    ui.notifications?.error(
      game.i18n?.localize('npcImporter.parser.NotValidStablock') as string,
    );
  }
}

function GetSections(clipData: string): string[] {
  let inputData = clipData.replace(/(\r\n|\n|\r)/gm, ' ').replace('/ ', '/');
  let indexes = GetSectionsIndex(inputData);
  if (indexes.length === 0) {
    throw 'Not a valid statblock';
  }
  var sections: string[] = [];
  for (let i = 0; i < indexes.length; i++) {
    if (i === indexes.length - 1) {
      sections.push(inputData.substring(indexes[i]).trim());
    } else {
      sections.push(inputData.substring(indexes[i], indexes[i + 1]).trim());
    }
  }
  return sections;
}

function GetSectionsIndex(inputData: string) {
  const allStatBlockEntities = [
    `${game?.i18n?.localize('npcImporter.parser.Attributes')}:`,
    `${game?.i18n?.localize('npcImporter.parser.Skills')}:`,
    `${game?.i18n?.localize('npcImporter.parser.Hindrances')}:`,
    `${game?.i18n?.localize('npcImporter.parser.Edges')}:`,
    `${game?.i18n?.localize('npcImporter.parser.Powers')}:`,
    `${game?.i18n?.localize('npcImporter.parser.Pace')}:`,
    `${game?.i18n?.localize('npcImporter.parser.Parry')}:`,
    `${game?.i18n?.localize('npcImporter.parser.Toughness')}:`,
    `${game?.i18n?.localize('npcImporter.parser.PowerPoints')}:`,
    `${game?.i18n?.localize('npcImporter.parser.Gear')}:`,
    `${game?.i18n?.localize('npcImporter.parser.SpecialAbilities')}:`,
    `${game?.i18n?.localize('npcImporter.parser.SuperPowers')}:`,
    `${game?.i18n?.localize('npcImporter.parser.Conviction')}:`,
  ];

  let allStats = allStatBlockEntities.concat(getActorAddtionalStatsArray());
  let sectionsIndex: number[] = [];
  allStats.forEach(element => {
    let index = inputData.search(new RegExp(element, 'i'));
    if (index > 0) {
      sectionsIndex.push(index);
    }
  });
  return sectionsIndex.sort(function (a, b) {
    return a - b;
  });
}

function getNameAndDescription(data: string) {
  let nameAndDescription = data
    .split(game.i18n?.localize('npcImporter.parser.Attributes') as string)[0]
    .trim();
  let nameDesc: any = {};
  let lines = nameAndDescription.split(global.newLineRegex);
  nameDesc.Name = capitalizeEveryWord(lines[0].trim());
  lines.shift();
  let bio = descriptionByParagraph(lines);
  nameDesc.Biography = {
    value: bio,
  };

  return nameDesc;
}

function descriptionByParagraph(descArray: string[]): string {
  let bio = '';
  descArray.forEach(line => {
    if (line.trim().endsWith('.')) {
      line = line + '<br/>';
    }
    bio += `${line} `;
  });
  return bio;
}

function getAttributes(sections: string[]): any {
  let attrTranslation = new RegExp(
    `${game.i18n?.localize('npcImporter.parser.Attributes')}:`,
    'i',
  );
  const attrSection = sections.find(x => x.match(attrTranslation));
  if (!attrSection) {
    return { Attributes: {} };
  }
  let attributes = splitAndTrim(attrSection.replace(attrTranslation, ''), ',');
  let attributesDict = {};

  attributes.forEach(singleTrait => {
    if (
      singleTrait.startsWith(
        game.i18n?.localize('npcImporter.parser.Agility') as string,
      )
    ) {
      attributesDict.agility = buildTrait(
        singleTrait
          .replace(
            game.i18n?.localize('npcImporter.parser.Agility') as string,
            '',
          )
          .trim(),
      );
    } else if (
      singleTrait.startsWith(
        game.i18n?.localize('npcImporter.parser.Smarts') as string,
      )
    ) {
      let animal = false;
      if (singleTrait.includes('(A)')) {
        animal = true;
        singleTrait = singleTrait.replace('(A)', '');
      }
      attributesDict.smarts = buildTrait(
        singleTrait
          .replace(
            game.i18n?.localize('npcImporter.parser.Smarts') as string,
            '',
          )
          .trim(),
      );
      if (animal) {
        attributesDict.smarts.animal = animal;
      }
    } else if (
      singleTrait.startsWith(
        game.i18n?.localize('npcImporter.parser.Spirit') as string,
      )
    ) {
      attributesDict.spirit = buildTrait(
        singleTrait
          .replace(
            game.i18n?.localize('npcImporter.parser.Spirit') as string,
            '',
          )
          .trim(),
      );
    } else if (
      singleTrait.startsWith(
        game.i18n?.localize('npcImporter.parser.Strength') as string,
      )
    ) {
      attributesDict.strength = buildTrait(
        singleTrait
          .replace(
            game.i18n?.localize('npcImporter.parser.Strength') as string,
            '',
          )
          .trim(),
      );
    } else if (
      singleTrait.startsWith(
        game.i18n?.localize('npcImporter.parser.Vigor') as string,
      )
    ) {
      attributesDict.vigor = buildTrait(
        singleTrait
          .replace(
            game.i18n?.localize('npcImporter.parser.Vigor') as string,
            '',
          )
          .trim(),
      );
    }
  });
  return { Attributes: attributesDict };
}

function getSkills(sections: string[]): any {
  let trait = new RegExp(
    `${game.i18n?.localize('npcImporter.parser.Skills')}:`,
    'i',
  );
  const skillsSection = sections.find(x => x.match(trait));
  let skills = skillsSection
    ? splitAndTrim(skillsSection.replace(trait, ''), ',')
    : [];
  let skillsDict: { [key: string]: any } = {};
  skills.forEach(singleTrait => {
    const matchResult = singleTrait.match(
      new RegExp(game.i18n?.localize('npcImporter.regex.dice') || '', 'i'),
    );
    let diceAndMode = matchResult ? matchResult[0].toString() : '';
    let traitName = singleTrait
      .replace(diceAndMode, '')
      .trim()
      .replace(' )', ')');
    if (traitName) {
      skillsDict[traitName.toLowerCase().replace(':', '').replace('.', '')] =
        buildTrait(diceAndMode);
    }
  });
  return { Skills: skillsDict };
}

function buildTrait(data: string): any {
  let diceAndMode = '';
  try {
    const diceRegex = game.i18n?.localize('npcImporter.regex.dice') || '';
    const matchResult = data.match(new RegExp(diceRegex, 'i'));
    diceAndMode = matchResult ? matchResult[0].toString() : '';
  } catch (error) {
    diceAndMode = '1'; // usually will be 1, if not then we'll need to think about it.
  }

  let traitDice = diceAndMode.includes('+')
    ? diceAndMode.split('+')[0]
    : diceAndMode.split('-')[0];
  let traitMod = diceAndMode.includes('+')
    ? `+${diceAndMode.split('+')[1]}`
    : diceAndMode.includes('-')
      ? `-${diceAndMode.split('-')[1]}`
      : '0';

  return {
    die: {
      sides: parseInt(traitDice.trim().replace(/[A-Za-z]/i, '')),
      modifier: parseInt(traitMod.trim()),
    },
  };
}

function getBaseStats(sections: string[]): any {
  let baseStats = [
    `${game.i18n?.localize('npcImporter.parser.Pace')}:`,
    `${game.i18n?.localize('npcImporter.parser.Parry')}:`,
    `${game.i18n?.localize('npcImporter.parser.Toughness')}:`,
    `${game.i18n?.localize('npcImporter.parser.PowerPoints')}:`,
  ];

  let retrievedStats = {};
  baseStats.forEach(stat => {
    let data = sections.find(x => x.includes(stat));
    if (
      data != undefined &&
      data.startsWith(game.i18n?.localize('npcImporter.parser.Pace') as string)
    ) {
      retrievedStats.Pace = getStatNumber(data);
    } else if (
      data != undefined &&
      data.startsWith(game.i18n?.localize('npcImporter.parser.Parry') as string)
    ) {
      retrievedStats.Parry = getStatNumber(data);
    } else if (
      data != undefined &&
      data.startsWith(
        game.i18n?.localize('npcImporter.parser.Toughness') as string,
      )
    ) {
      retrievedStats.Toughness = getStatNumber(data);
    } else if (
      data != undefined &&
      data.startsWith(
        game.i18n?.localize('npcImporter.parser.PowerPoints') as string,
      )
    ) {
      retrievedStats.PowerPoints = getStatNumber(data);
    }
  });
  return retrievedStats;
}

function getStatNumber(data: string): number {
  return parseInt(data.split(':')[1].replace(';', '').trim());
}

function getListsStats(sections: string[]): any {
  const hindrances = new RegExp(
    `${game.i18n?.localize('npcImporter.parser.Hindrances')}:`,
    'i',
  );
  const edges = new RegExp(
    `${game.i18n?.localize('npcImporter.parser.Edges')}:`,
    'i',
  );
  const powers = new RegExp(
    `${game.i18n?.localize('npcImporter.parser.Powers')}:`,
    'i',
  );
  const supportedListStats = [hindrances, edges, powers];

  let retrievedListStats = {};
  supportedListStats.forEach(element => {
    var line = sections.find(x => x.match(element));
    if (line && line.match(hindrances)) {
      retrievedListStats.Hindrances = parseEdgesHindrances(line);
    } else if (line && line.match(edges)) {
      retrievedListStats.Edges = parseEdgesHindrances(line);
    } else if (line && line.match(powers)) {
      retrievedListStats.Powers = cleanLine(line.replace(', and', ',')).split(
        ',',
      );
    }
  });
  return retrievedListStats;
}

function cleanLine(line: string): string {
  return line
    .slice(line.indexOf(':') + 1)
    .replace(global.newLineRegex, ' ')
    .replace('.', '')
    .trim();
}

function parseEdgesHindrances(line: string): string[] | undefined {
  const data = cleanLine(line);
  if (data.length > 1) {
    const matches = data.match(
      new RegExp(/([A-Za-zÀ-ÖØ-öø-ÿ0-9!\-’' ]+)(\(([^\)]+)\))?/gi),
    );
    return matches ? matches.map(s => s.trim()) : [];
  }
}

function getBulletListStats(sections: string[]): any {
  const supportedBulletListStats = [
    `${game.i18n?.localize('npcImporter.parser.SpecialAbilities')}:`,
    `${game.i18n?.localize('npcImporter.parser.SuperPowers')}:`,
  ];

  var retrievedBulletListStats = {};
  supportedBulletListStats.forEach(bulletList => {
    var line = sections.find(x => x.includes(bulletList));
    if (
      line != undefined &&
      line.startsWith(
        game.i18n?.localize('npcImporter.parser.SpecialAbilities') || '',
      )
    ) {
      retrievedBulletListStats.SpecialAbilities = getAbilities(
        line
          .replace(
            `${game.i18n?.localize('npcImporter.parser.SpecialAbilities')}:`,
            '',
          )
          .trim(),
      );
    } else if (
      line != undefined &&
      line.startsWith(
        game.i18n?.localize('npcImporter.parser.SuperPowers') || '',
      )
    ) {
      retrievedBulletListStats.SuperPowers = getAbilities(
        line
          .replace(
            `${game.i18n?.localize('npcImporter.parser.SuperPowers')}:`,
            '',
          )
          .trim(),
      );
    }
  });
  return retrievedBulletListStats;
}

function getAbilities(data: string): any {
  const modifiedSpecialAbs = getModuleSettings(
    global.settingModifiedSpecialAbs,
  );
  let abilities: { [key: string]: any } = {};
  let line: string[] = [];
  if (!modifiedSpecialAbs) {
    line = splitAndTrim(
      data,
      getModuleSettings(global.settingBulletPointIcons),
    );
  } else {
    line = splitAndTrim(data, '@');
  }

  line.shift();
  line.forEach(element => {
    let ability = element.split(':');
    let abilityName = !modifiedSpecialAbs
      ? ability[0].trim()
      : `@${ability[0].trim()}`;
    if (abilityName) {
      abilities[abilityName] =
        ability.length == 2
          ? ability[1].replace(global.newLineRegex, ' ').trim()
          : ability[0];
    }
  });

  return abilities;
}

async function getGear(sections: string[]): Promise<any> {
  let gearString = new RegExp(
    `${game.i18n?.localize('npcImporter.parser.Gear')}:`,
    'i',
  );
  try {
    let characterGear: string[] = [];
    let foundGearLine = sections.find(x => x.match(gearString));
    if (!foundGearLine) {
      return { Gear: {} };
    }
    let gearLine = foundGearLine
      .replace(global.newLineRegex, ' ')
      .replace(gearString, '')
      .trim();
    while (gearLine.length > 1) {
      if (global.gearParsingRegex.test(gearLine)) {
        const matchResult = gearLine.match(global.gearParsingRegex);
        if (matchResult && matchResult[0]) {
          let match = matchResult[0];
          characterGear.push(match.trim());
          gearLine = gearLine.replace(match, '');
        } else {
          characterGear.push(gearLine.trim());
          break;
        }
      } else {
        characterGear.push(gearLine.trim());
        break;
      }
    }

    return { Gear: await parseGear(characterGear) };
  } catch {}
}

async function parseGear(gearArray: string[]) {
  let parryRegex = new RegExp(
    `([+-])\\d+ ${game.i18n?.localize(
      'npcImporter.parser.Parry',
    )}|${game.i18n?.localize('npcImporter.parser.Parry')} ([+-])\\d+`,
  );

  let gearDict: Record<string, any> = {};
  gearArray.forEach(async gear => {
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
      splitGear[1] &&
      (splitGear[1].includes(
        game.i18n?.localize('npcImporter.parser.Str') as string,
      ) ||
        splitGear[1].toLowerCase().includes('damage') ||
        splitGear[1].toLowerCase().includes('range'))
    ) {
      gearDict[splitGear[0].trim()] = weaponParser(
        splitGear[1]
          .split(',')
          .filter(n => n)
          .map(function (x) {
            return x.trim();
          }),
      );
    }
    // check if shield
    else if (
      parryRegex.test(splitGear[1]) ||
      splitGear[0]
        .toLowerCase()
        .includes(
          (
            game.i18n?.localize('npcImporter.parser.Shield') || ''
          ).toLowerCase(),
        )
    ) {
      let parry = parserHelper.getBonus(splitGear[1], 'parry');
      let cover = parserHelper.getBonus(splitGear[1], 'cover');
      gearDict[splitGear[0].trim()] = { parry, cover };
    }
    // check if armor
    else if (
      global.armorModRegex.test(splitGear[1]) ||
      splitGear[0]
        .toLowerCase()
        .includes(game.i18n?.localize('npcImporter.parser.Armor') as string)
    ) {
      gearDict[splitGear[0].trim()] = {
        armorBonus: parserHelper.getArmorBonus(splitGear[1]),
      };
    }
  });
  return gearDict;
}

function weaponParser(weapon: string[]): any {
  let weaponStats: { [key: string]: any } = {};
  weapon.forEach(stat => {
    if (new RegExp('^Str', 'i').test(stat)) {
      weaponStats.damage = stat;
    } else {
      if (
        stat.includes(
          (game.i18n?.localize('npcImporter.parser.Shots') || '').toLowerCase(),
        )
      ) {
        weaponStats['shots'] = stat
          .replace(game.i18n?.localize('npcImporter.parser.Shots') || '', '')
          .trim();
      } else if (stat.match(new RegExp('^[A-Za-z]+'))) {
        const match = stat.match(new RegExp('^[A-Za-z]+'));
        if (match && match[0]) {
          let statName = match[0];
          weaponStats[statName.toLowerCase().trim()] = stat
            .replace(statName, '')
            .trim();
        }
      }
    }
  });
  return weaponStats;
}

function getSystemDefinedStats(sections: string[]): any {
  let additionalStats = getActorAddtionalStats();
  let systemStats: { [key: string]: string | number | boolean } = {};
  for (const key in additionalStats) {
    if (additionalStats.hasOwnProperty(key)) {
      const element = additionalStats[key];
      let stat = sections.find(x => x.startsWith(element.label));
      if (stat != undefined) {
        stat = stat.replace(global.newLineRegex, ' ');
        const statParts = stat.split(':');
        if (element.dtype === 'String') {
          systemStats[statParts[0]] = statParts[1].replace(';', '').trim();
        } else if (element.dtype === 'Number') {
          systemStats[statParts[0]] = parseInt(
            statParts[1].replace(';', '').trim().replace('–', '-'),
          );
        } else if (element.dtype === 'Boolean') {
          systemStats[statParts[0]] =
            statParts[1].replace(';', '').trim() == 'true';
        }
      }
    }
  }
  return systemStats;
}

function getSize(abilities: any): number {
  for (const ability in abilities) {
    if (
      ability
        .toLowerCase()
        .includes(
          (game.i18n?.localize('npcImporter.parser.Size') || '').toLowerCase(),
        )
    ) {
      return parseInt(
        ability
          .replace(new RegExp('@([aehw]|sa)?'), '')
          .trim()
          .split(' ')[1]
          .replace('−', '-')
          .replace('–', '-'),
      );
    }
  }
  return 0;
}

function getConviction(data: any[], biography: string): string {
  const conviction = data.find(x =>
    x.startsWith(game.i18n?.localize('npcImporter.parser.Conviction')),
  );
  return conviction ? `${conviction}<hr>${biography}` : biography;
}
