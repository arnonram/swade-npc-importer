import { armorModRegex, plusMinusNumRegex } from '../global.js';

export function GetMeleeDamage(abilityDescription: string): string {
  const meleeDamageRegex = new RegExp(
    `${game.i18n?.localize('npcImporter.parser.Str')}\.|${game.i18n?.localize(
      'npcImporter.parser.Str',
    )}(\s?[\+\-]?\s?(\d+)?X?(\d+)?){0,}`.replace(
      'X',
      game.i18n?.localize('npcImporter.parser.dice') ?? '',
    ),
    'gi',
  );

  let damage =
    abilityDescription
      .match(meleeDamageRegex)
      ?.toString()
      .replace('.', '')
      .toLowerCase() ?? '';
  return `@${damage}`;
}

export function getArmorBonus(data: string): number {
  return parseInt(data.match(armorModRegex)?.[0] ?? '0');
}

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
    let matchRegex = new RegExp(
      `${plusMinusNumRegex} ${type}|${type} ${plusMinusNumRegex}`,
    );
    const match = data.match(matchRegex)?.[0];
    if (!match) return undefined;
    const num = match.match(plusMinusNumRegex)?.[0];
    return num ? parseInt(num) : undefined;
  } catch (error) {
    return undefined;
  }
}
