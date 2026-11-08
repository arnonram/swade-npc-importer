import type { ParsedActor } from '../types/importedActor';
import { getSections } from './getSections';
import { getBio, getName, hasWildCardMarker } from './getNameAndDesc';
import { getAttributes, getSkills } from './getTraits';
import { getListStat, getProseList, ListType } from './getListsStats';
import { AbilityType, getAbilityList } from './getAbilities';
import { getGear, getGearNotes } from './getGear';
import { joinBrokenLines } from '../utils/textUtils';
import { getSystemDefinedStats } from './getSystemStats';
import {
  getDerivedStats,
  DerivedStatType,
  getSize,
  powerPointsFromSpecialAbility,
  getToughness,
} from './getDerivedStats';
import { Logger } from '../utils/logger';
import { foundryI18nLocalize, foundryUiError } from '../utils/foundryWrappers';

export async function statBlockParser(
  rawStatBlock: string,
): Promise<ParsedActor> {
  try {
    Logger.info('Starting statblock parsing');

    rawStatBlock = joinBrokenLines(rawStatBlock);
    const sections = getSections(rawStatBlock);
    const prosePowers = getProseList(sections, ListType.Powers);
    const proseHindrances = getProseList(sections, ListType.Hindrances);
    // Sentences that can't become items are kept in the biography.
    const biography = [
      getBio(rawStatBlock, sections),
      proseHindrances,
      prosePowers,
      getGearNotes(sections),
    ]
      .filter(Boolean)
      .join('<hr>');
    let importedActor: ParsedActor = {
      name: getName(rawStatBlock),
      wildCard: hasWildCardMarker(rawStatBlock),
      biography,
      attributes: getAttributes(sections),
      skills: getSkills(sections),
      pace: getDerivedStats(sections, DerivedStatType.Pace),
      toughness: getToughness(sections),
      parry: getDerivedStats(sections, DerivedStatType.Parry),
      powerPoints: getDerivedStats(sections, DerivedStatType.PowerPoints),
      edges: getListStat(sections, ListType.Edges),
      hindrances: proseHindrances
        ? []
        : getListStat(sections, ListType.Hindrances),
      powers: prosePowers ? [] : getListStat(sections, ListType.Powers),
      specialAbilities: getAbilityList(sections, AbilityType.SpecialAbilities),
      superPowers: getAbilityList(sections, AbilityType.SuperPowers),
      gear: await getGear(sections),
    };

    importedActor = {
      ...importedActor,
      ...getSystemDefinedStats(sections),
    };
    importedActor.size = getSize(importedActor.specialAbilities ?? {});

    if (!importedActor.powerPoints && importedActor.specialAbilities) {
      importedActor.powerPoints = powerPointsFromSpecialAbility(
        importedActor.specialAbilities,
      );
    }

    Logger.info('Parsed data', importedActor);
    return importedActor;
  } catch (error) {
    foundryUiError(foundryI18nLocalize('npcImporter.parser.NotValidStablock'));
    throw new Error(
      foundryI18nLocalize('npcImporter.parser.NotValidStablock'),
      error,
    );
  }
}
