import { BonusType } from '../types/enums';
import { foundryI18nLocalize } from '../utils/foundryWrappers';
import { getBonus } from './parserBuilderHelpers';

export function getDerivedStats(
  sections: string[],
  derivedStatToGet: DerivedStatType,
): number | undefined {
  const label = foundryI18nLocalize(
    `npcImporter.parser.${derivedStatToGet}`,
  ) as string;
  const data = sections.find(x => x.startsWith(`${label}:`));
  return data ? getStatNumber(data) : 0;
}

export function getSize(abilities: Record<string, string>): number {
  const sizeLabel = foundryI18nLocalize(
    'npcImporter.parser.Size',
  ).toLowerCase();
  for (const ability of Object.keys(abilities)) {
    if (ability.toLowerCase().includes(sizeLabel)) {
      const parts = ability
        .replace(new RegExp('@([aehw]|sa)?'), '')
        .trim()
        .split(' ');
      if (parts.length > 1) {
        const num = parseInt(parts[1]);
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
    return getBonus(powerAbility.system.description, BonusType.POWERPOINTS);
  }
  return undefined;
}

function getStatNumber(data: string): number {
  const parts = data.split(':');
  if (parts.length < 2) return 0;
  const num = parseInt(parts[1].replace(';', '').trim());
  return isNaN(num) ? 0 : num;
}

export function getToughness(data: string[]) {
  const toughnessData = data
    .find(x =>
      x.startsWith(`${foundryI18nLocalize('npcImporter.parser.Toughness')}:`),
    )
    ?.split(':')[1];
  if (toughnessData) {
    const match = toughnessData.match(/(\d+)\s*(?:\((\d+)\))?\s*;?/);
    if (match) {
      const value = parseInt(match[1]);
      const armor = match[2] ? parseInt(match[2]) : 0;
      return { value, modifier: 0, armor };
    }
  }
  return { value: 0, modifier: 0, armor: 0 };
}

export enum DerivedStatType {
  Pace = 'Pace',
  Parry = 'Parry',
  Toughness = 'Toughness',
  PowerPoints = 'PowerPoints',
  Size = 'Size',
}
