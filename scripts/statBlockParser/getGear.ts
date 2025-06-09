import { armorModRegex, gearParsingRegex, newLineRegex } from '../global';
import { getBonus, getArmorBonus } from '../utils/parserBuilderHelpers';

export async function getGear(
  sections: string[],
): Promise<Record<string, any>> {
  let gearString = new RegExp(
    `${game.i18n?.localize('npcImporter.parser.Gear')}:`,
    'i',
  );

  let characterGear: string[] = [];
  let foundGearLine = sections.find(x => x.match(gearString));
  if (!foundGearLine) {
    return { Gear: {} };
  }
  let gearLine = foundGearLine
    .replace(newLineRegex, ' ')
    .replace(gearString, '')
    .trim();
  while (gearLine.length > 1) {
    if (gearParsingRegex.test(gearLine)) {
      const matchResult = gearLine.match(gearParsingRegex);
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

  return parseGear(characterGear);
}

async function parseGear(gearArray: string[]): Promise<Record<string, any>> {
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
      let parry = getBonus(splitGear[1], 'parry');
      let cover = getBonus(splitGear[1], 'cover');
      gearDict[splitGear[0].trim()] = { parry, cover };
    }
    // check if armor
    else if (
      armorModRegex.test(splitGear[1]) ||
      splitGear[0]
        .toLowerCase()
        .includes(game.i18n?.localize('npcImporter.parser.Armor') as string)
    ) {
      gearDict[splitGear[0].trim()] = {
        armorBonus: getArmorBonus(splitGear[1]),
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
