import { BonusType } from '../types/enums';
import { foundryI18nLocalize } from '../../src/utils/foundryWrappers';
import { armorModRegex } from '../global';
import { ImportedDie } from 'src/types/importedActor';

/**
 * Extracts melee damage from an ability description.
 */
export function getMeleeDamage(abilityDescription: string): string {
  const strLabel = foundryI18nLocalize('npcImporter.parser.Str') || 'Str';
  const diceLabel = foundryI18nLocalize('npcImporter.parser.dice') || 'd';
  const meleeDamagePattern = `${strLabel}\\.|${strLabel}(\\s?[\\+\\-]?\\s?(\\d+)?${diceLabel}?(\\d+)?){0,}`;
  const meleeDamageRegex = new RegExp(meleeDamagePattern, 'gi');

  const match = abilityDescription.match(meleeDamageRegex);
  let damage = match?.toString().replace(/\.$/, '').toLowerCase() ?? '';
  return `@${damage}`;
}

/**
 * Extracts armor bonus from a string.
 */
export function getArmorBonus(data: string): number {
  const match = data.match(armorModRegex)?.[0];
  const num = parseInt(match ?? '0');
  return isNaN(num) ? 0 : num;
}

/**
 * Extracts a numeric bonus of a given type from a string.
 */
export function getBonus(
  data: string,
  bonusType: BonusType,
): number | undefined {
  const label = bonusLabelMap[bonusType];
  if (!label) return undefined;

  const match = data.match(
    new RegExp(`([+-]?\\d+)\\s*${label}|${label}:?\\s*([+-]?\\d+)`, 'i'),
  );
  const rawNum = match?.[1] || match?.[2];
  const parsed = rawNum ? parseInt(rawNum) : undefined;

  return Number.isNaN(parsed) ? undefined : parsed;
}

const bonusLabelMap: Record<string, string> = {
  parry: foundryI18nLocalize('npcImporter.parser.Parry') || 'Parry',
  cover: foundryI18nLocalize('npcImporter.parser.Cover') || 'Cover',
  powerPoints:
    foundryI18nLocalize('npcImporter.parser.PowerPoints') || 'Power Points',
};

/**
 * Builds a trait die object from a string.
 * The string should contain a die notation like "d6" or "1d8+2".
 * Returns an object with sides and modifier properties.
 */
export function buildTraitDie(data: string): ImportedDie {
  const cleaned = data.replace(/\s+/g, '');
  const match = cleaned.match(/d(\d+)([+-]\d+)?/i);
  if (!match) return { sides: 0, modifier: 0 };
  const sides = parseInt(match[1], 10);
  const modifier = match[2] ? parseInt(match[2], 10) : 0;
  return { sides, modifier };
}
