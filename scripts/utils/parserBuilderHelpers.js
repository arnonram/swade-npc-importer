import { armorModRegex, plusMinusNumRegex } from '../global.js';

export function GetMeleeDamage(abilityDescription) {
  const meleeDamageRegex = new RegExp(
    `${game.i18n.localize('npcImporter.parser.Str')}\\.|${game.i18n.localize(
      'npcImporter.parser.Str'
    )}(\s?[\+\-]?\s?(\d+)?X?(\d+)?){0,}`.replace(
      'X',
      game.i18n.localize('npcImporter.parser.dice')
    ),
    'gi'
  );

  let damage = abilityDescription
    .match(meleeDamageRegex)
    .toString()
    .replace('.', '')
    .toLowerCase();
  return `@${damage}`;
}

export function getArmorBonus(data) {
  return parseInt(data.match(armorModRegex)[0]);
}

export function getBonus(data, bonusType) {
  let type;
  switch (bonusType) {
    case 'parry':
      type = game.i18n.localize('npcImporter.parser.Parry');
    case 'cover':
      type = game.i18n.localize('npcImporter.parser.Cover');
    case 'powerPoints':
      type = game.i18n.localize('npcImporter.parser.PowerPoints');
  }

  try {
    let matchRegex = new RegExp(
      `${plusMinusNumRegex} ${type}|${type} ${plusMinusNumRegex}`
    );
    return parseInt(data.match(matchRegex)[0].match(plusMinusNumRegex));
  } catch (error) {}
}
