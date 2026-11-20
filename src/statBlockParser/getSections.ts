import { getActorAddtionalStatsArray } from '../utils/foundryActions';
import { AbilityType, abilityHeaderRegexes } from './getAbilities';

/**
 * Splits a statblock string into its sections based on known labels.
 */
export function getSections(clipData: string): string[] {
  const inputData = clipData
    .replace(/(\r\n|\n|\r)/gm, ' ')
    .replace('/ ', '/')
    .replace(/\u00AD/g, '') // Remove soft hyphens
    .replace(/[−–]/gi, '-');
  const indexes = getSectionsIndex(inputData);
  if (indexes.length === 0) {
    throw new Error('Not a valid statblock');
  }
  const sections: string[] = indexes.map((start, i) =>
    inputData.substring(start, indexes[i + 1] ?? undefined).trim(),
  );
  return sections;
}

function getSectionsIndex(inputData: string): number[] {
  const allStatBlockEntities = [
    `${game?.i18n?.localize('npcImporter.parser.Attributes')}:`,
    `${game?.i18n?.localize('npcImporter.parser.Skills')}:`,
    `${game?.i18n?.localize('npcImporter.parser.Hindrances')}:`,
    `${game?.i18n?.localize('npcImporter.parser.Edges')}:`,
    `${game?.i18n?.localize('npcImporter.parser.Powers')}:`,
    `${game?.i18n?.localize('npcImporter.parser.Spells')}:`,
    `${game?.i18n?.localize('npcImporter.parser.Miracles')}:`,
    `${game?.i18n?.localize('npcImporter.parser.Pace')}:`,
    `${game?.i18n?.localize('npcImporter.parser.Parry')}:`,
    `${game?.i18n?.localize('npcImporter.parser.Toughness')}:`,
    `${game?.i18n?.localize('npcImporter.parser.PowerPoints')}:`,
    `${game?.i18n?.localize('npcImporter.parser.Gear')}:`,
    `${game?.i18n?.localize('npcImporter.parser.Conviction')}:`,
  ];

  const allStats = allStatBlockEntities
    .concat(getActorAddtionalStatsArray())
    .map(element => new RegExp(element, 'i'))
    .concat(
      abilityHeaderRegexes(AbilityType.SpecialAbilities),
      abilityHeaderRegexes(AbilityType.SuperPowers),
    );
  const sectionsIndex: number[] = [];
  allStats.forEach(element => {
    const index = inputData.search(element);
    if (index >= 0) {
      sectionsIndex.push(index);
    }
  });
  return [...new Set(sectionsIndex)].sort((a, b) => a - b);
}
