import { removeEmptyArrayProp } from '../utils/textUtils';
import { armorModRegex, newLineRegex } from '../global';
import { foundryI18nLocalize } from '../utils/foundryWrappers';
import { getBonus, getArmorBonus } from './parserBuilderHelpers';
import { BonusType } from '../types/enums';

const gearParsingRegex = /([A-Za-zÀ-ÖØ-öø-ÿ0-9 \.\-]+)(\(([^()]+)\))?,?/gi;

/**
 * Parses the gear section from stat block sections.
 */
export async function getGear(
  sections: string[],
): Promise<Record<string, any>> {
  const gearLabel = foundryI18nLocalize('npcImporter.parser.Gear') || 'Gear';
  const gearRegex = new RegExp(`${gearLabel}:`, 'i');

  const foundGearLine = sections.find(line => gearRegex.test(line));
  if (!foundGearLine) return {};

  const rawGear = foundGearLine
    .replace(gearRegex, '')
    .replace(newLineRegex, ' ')
    .trim();

  // Extract matches using the global regex
  let matches = [...rawGear.matchAll(gearParsingRegex)].map(m => m[0].trim());
  matches = removeEmptyArrayProp(matches);

  // Fallback: if no matches (edge case), use the entire line
  const characterGear = matches.length > 0 ? matches : [rawGear];

  return parseGear(characterGear);
}

/**
 * Parses an array of gear strings into a gear dictionary.
 */
function parseGear(gearArray: string[]): Record<string, any> {
  const parryRegex = new RegExp(
    `([+-])\\d+ ${foundryI18nLocalize(
      'npcImporter.parser.Parry',
    )}|${foundryI18nLocalize('npcImporter.parser.Parry')} ([+-])\\d+`,
  );

  const gearDict: Record<string, any> = {};
  for (const gear of gearArray) {
    const splitGear = gear.replace(')', '').split('(');

    // Normal gear
    if (splitGear.length === 1) {
      let normalGear = splitGear[0].replace(/[.,]$/, '');
      if (normalGear !== '.') {
        gearDict[normalGear.trim()] = null;
      }
      continue;
    }

    // Weapon
    if (
      splitGear[1] &&
      (splitGear[1].includes(foundryI18nLocalize('npcImporter.parser.Str')) ||
        splitGear[1].toLowerCase().includes('damage') ||
        splitGear[1].toLowerCase().includes('range'))
    ) {
      gearDict[splitGear[0].trim()] = weaponParser(
        splitGear[1]
          .split(',')
          .filter(n => n)
          .map(x => x.trim()),
      );
      continue;
    }

    // Shield
    if (
      parryRegex.test(splitGear[1]) ||
      splitGear[0]
        .toLowerCase()
        .includes(
          foundryI18nLocalize('npcImporter.parser.Shield').toLowerCase(),
        )
    ) {
      const parry = getBonus(splitGear[1], BonusType.PARRY);
      const cover = getBonus(splitGear[1], BonusType.COVER);
      gearDict[splitGear[0].trim()] = { parry, cover };
      continue;
    }

    // Armor
    if (
      armorModRegex.test(splitGear[1]) ||
      splitGear[0]
        .toLowerCase()
        .includes(foundryI18nLocalize('npcImporter.parser.Armor').toLowerCase())
    ) {
      gearDict[splitGear[0].trim()] = {
        armorBonus: getArmorBonus(splitGear[1]),
      };
      continue;
    }
  }
  return gearDict;
}

/**
 * Parses weapon stats from an array of weapon strings.
 */
function weaponParser(weapon: string[]): Record<string, any> {
  const weaponStats: Record<string, any> = {};
  for (const stat of weapon) {
    if (/^Str/i.test(stat)) {
      weaponStats.damage = stat;
    } else if (
      stat
        .toLowerCase()
        .includes(foundryI18nLocalize('npcImporter.parser.Shots').toLowerCase())
    ) {
      weaponStats['shots'] = stat
        .replace(foundryI18nLocalize('npcImporter.parser.Shots'), '')
        .trim();
    } else if (/^[A-Za-z]+/.test(stat)) {
      const match = stat.match(/^[A-Za-z]+/);
      if (match && match[0]) {
        const statName = match[0];
        weaponStats[statName.toLowerCase().trim()] = stat
          .replace(statName, '')
          .trim();
      }
    }
  }
  return weaponStats;
}
