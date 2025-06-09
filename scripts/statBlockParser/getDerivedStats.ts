import { getBonus } from '../utils/parserBuilderHelpers';

export function getDerivedStats(
  sections: string[],
  derivedStatToGet: DerivedStatType,
) {
  const label = game.i18n?.localize(
    `npcImporter.parser.${derivedStatToGet}`,
  ) as string;
  const data = sections.find(x => x.startsWith(`${label}:`));
  return data ? getStatNumber(data) : undefined;
}

export function getSize(abilities: any): number {
  for (const ability in abilities) {
    if (
      ability
        .toLowerCase()
        .includes(
          (game.i18n?.localize('npcImporter.parser.Size') || '').toLowerCase(),
        )
    ) {
      return parseInt(
        ability
          .replace(new RegExp('@([aehw]|sa)?'), '')
          .trim()
          .split(' ')[1]
          .replace('−', '-')
          .replace('–', '-'),
      );
    }
  }
  return 0;
}

export function powerPointsFromSpecialAbility(
  abilities: Record<string, any>,
): number | undefined {
  let powerAbility = Object.values(abilities).filter(
    items => items.system?.grantsPowers === true,
  );
  if (powerAbility.length > 0) {
    return getBonus(powerAbility[0].system.description, 'powerPoints');
  }
  return undefined;
}

function getStatNumber(data: string): number {
  return parseInt(data.split(':')[1].replace(';', '').trim());
}

export enum DerivedStatType {
  Pace = 'Pace',
  Parry = 'Parry',
  Toughness = 'Toughness',
  PowerPoints = 'PowerPoints',
  Size = 'Size',
}
