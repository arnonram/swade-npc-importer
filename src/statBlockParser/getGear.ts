import { removeEmptyArrayProp } from '../utils/textUtils';
import { armorModRegex, newLineRegex } from '../global';
import { foundryI18nLocalize } from '../utils/foundryWrappers';
import { getBonus, getArmorBonus } from './parserBuilderHelpers';
import { BonusType } from '../types/enums';

const gearParsingRegex = /([A-Za-zÀ-ÖØ-öø-ÿ0-9 .-]+)(\(([^()]+)\))?,?/gi;

/**
 * Parses the gear section from stat block sections.
 */
export async function getGear(
  sections: string[],
): Promise<Record<string, any>> {
  const gearText = getGearText(sections);
  if (!gearText) return {};
  const rawGear = gearText.list;

  // Extract matches using the global regex
  let matches = [...rawGear.matchAll(gearParsingRegex)].map(m => m[0].trim());
  matches = removeEmptyArrayProp(matches);

  // Fallback: if no matches (edge case), use the entire line
  const characterGear = matches.length > 0 ? matches : [rawGear];

  return parseGear(characterGear);
}

/**
 * Text after the gear list, e.g. "Anyone struck by a balefire weapon... catches fire."
 */
export function getGearNotes(sections: string[]): string | undefined {
  return getGearText(sections)?.notes || undefined;
}

/**
 * Splits the gear section into the item list and any sentences that follow it.
 * The list ends at the first period outside parentheses that starts a new sentence.
 */
function getGearText(
  sections: string[],
): { list: string; notes: string } | undefined {
  const gearLabel = foundryI18nLocalize('npcImporter.parser.Gear') || 'Gear';
  const gearRegex = new RegExp(`${gearLabel}:`, 'i');
  const foundGearLine = sections.find(line => gearRegex.test(line));
  if (!foundGearLine) return undefined;

  const text = foundGearLine
    .replace(gearRegex, '')
    .replace(newLineRegex, ' ')
    .trim();
  let depth = 0;
  for (let i = 0; i < text.length; i++) {
    if (text[i] === '(') depth++;
    if (text[i] === ')') depth = Math.max(0, depth - 1);
    if (
      text[i] === '.' &&
      depth === 0 &&
      /^\s+\p{Lu}/u.test(text.slice(i + 1))
    ) {
      return { list: text.slice(0, i), notes: text.slice(i + 1).trim() };
    }
  }
  return { list: text, notes: '' };
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
      const normalGear = splitGear[0].replace(/[.,]$/, '');
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
      weaponStats.shots = stat
        .replace(foundryI18nLocalize('npcImporter.parser.Shots'), '')
        .replace(/^\s*:/, '')
        .trim();
    } else {
      // "Range 4/8/16" or "Range: 4/8/16"
      const match = stat.match(/^([A-Za-z]+)\s*:?\s*(.*)$/);
      if (match) {
        weaponStats[match[1].toLowerCase()] = match[2].trim();
      }
    }
  }
  return weaponStats;
}
