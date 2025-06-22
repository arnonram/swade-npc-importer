import { armorModRegex, plusMinusNumRegex } from '../global.js';

/**
 * Extracts melee damage from an ability description.
 */
export function GetMeleeDamage(abilityDescription: string): string {
  const strLabel = game.i18n?.localize('npcImporter.parser.Str') || 'Str';
  const diceLabel = game.i18n?.localize('npcImporter.parser.dice') || 'd';
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
  parry: game.i18n?.localize('npcImporter.parser.Parry') || 'Parry',
  cover: game.i18n?.localize('npcImporter.parser.Cover') || 'Cover',
  powerPoints:
    game.i18n?.localize('npcImporter.parser.PowerPoints') || 'Power Points',
};
