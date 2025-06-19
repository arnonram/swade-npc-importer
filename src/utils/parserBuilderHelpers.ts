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
  let type: string | undefined;
  switch (bonusType) {
    case 'parry':
      type = game.i18n?.localize('npcImporter.parser.Parry');
      break;
    case 'cover':
      type = game.i18n?.localize('npcImporter.parser.Cover');
      break;
    case 'powerPoints':
      type = game.i18n?.localize('npcImporter.parser.PowerPoints');
      break;
  }

  if (!type) return undefined;

  try {
    const matchRegex = new RegExp(
      `${plusMinusNumRegex} ${type}|${type} ${plusMinusNumRegex}`,
    );
    const match = data.match(matchRegex)?.[0];
    if (!match) return undefined;
    const num = match.match(plusMinusNumRegex)?.[0];
    const parsed = num ? parseInt(num) : undefined;
    return typeof parsed === 'number' && !isNaN(parsed) ? parsed : undefined;
  } catch {
    return undefined;
  }
}
