import { getBonus } from '../utils/parserBuilderHelpers';

export function getDerivedStats(
  sections: string[],
  derivedStatToGet: DerivedStatType,
): number | undefined {
  const label = game.i18n?.localize(
    `npcImporter.parser.${derivedStatToGet}`,
  ) as string;
  const data = sections.find(x => x.startsWith(`${label}:`));
  return data ? getStatNumber(data) : undefined;
}

export function getSize(abilities: Record<string, string>): number {
  const sizeLabel = (
    game.i18n?.localize('npcImporter.parser.Size') || ''
  ).toLowerCase();
  for (const ability of Object.keys(abilities)) {
    if (ability.toLowerCase().includes(sizeLabel)) {
      const parts = ability
        .replace(new RegExp('@([aehw]|sa)?'), '')
        .trim()
        .split(' ');
      if (parts.length > 1) {
        const num = parseInt(parts[1].replace('−', '-').replace('–', '-'));
        return isNaN(num) ? 0 : num;
      }
    }
  }
  return 0;
}

export function powerPointsFromSpecialAbility(
  abilities: Record<string, any>,
): number | undefined {
  const powerAbility = Object.values(abilities).find(
    items => items.system?.grantsPowers === true,
  );
  if (powerAbility) {
    return getBonus(powerAbility.system.description, 'powerPoints');
  }
  return undefined;
}

function getStatNumber(data: string): number {
  const parts = data.split(':');
  if (parts.length < 2) return 0;
  const num = parseInt(parts[1].replace(';', '').trim());
  return isNaN(num) ? 0 : num;
}

export enum DerivedStatType {
  Pace = 'Pace',
  Parry = 'Parry',
  Toughness = 'Toughness',
  PowerPoints = 'PowerPoints',
  Size = 'Size',
}
