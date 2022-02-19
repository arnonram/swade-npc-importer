import { armorModRegex } from '../global.js';

export function GetMeleeDamage(abilityDescription) {
  const meleeDamageRegex = new RegExp(
    `${game.i18n.localize('npcImporter.parser.Str')}\\.|${game.i18n.localize(
      'npcImporter.parser.Str'
    )}(\s?[\+\-]?\s?(\d+)?d?(\d+)?){0,}`,
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

export function getParryBonus(data) {
  let parryRegex = new RegExp(
    `([+-])\\d+ ${game.i18n.localize('npcImporter.parser.Parry')}`
  );
  return parseInt(data.match(parryRegex)[0]);
}

export function getCoverBonus(data) {
  let coverRegex = new RegExp(
    `([+-])\\d+ ${game.i18n.localize('npcImporter.parser.Cover')}`
  );
  return parseInt(data.match(coverRegex)[0]);
}

export function getPowerPoints(data) {
  const powerPointsRegex = new RegExp(
    `\\d+ ${game.i18n.localize('npcImporter.parser.PowerPoints')}`
  );
  try {
    let powerPointsNumber = data.match(powerPointsRegex)[0];
    return parseInt(
      powerPointsNumber
        .replace(game.i18n.localize('npcImporter.parser.PowerPoints'), '')
        .trim()
    );
  } catch {}
}
