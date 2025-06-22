import { armorModRegex } from '../global.js';
import { foundryI18nLocalize } from './foundryWrappers.js';

/**
 * Extracts melee damage from an ability description.
 */
export function GetMeleeDamage(abilityDescription: string): string {
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
export function getBonus(data: string, bonusType: string): number | undefined {
  const label = bonusLabelMap[bonusType];
  if (!label) return undefined;

  const match = data.match(
    new RegExp(`([+-]?\\d+)\\s*${label}|${label}\\s*([+-]?\\d+)`, 'i'),
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
