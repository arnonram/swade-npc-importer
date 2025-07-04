import { ParsedActor } from '../types/importedActor';
import { getSections } from './getSections';
import { getBio, getName } from './getNameAndDesc';
import { getAttributes, getSkills } from './getTraits';
import { getListStat, ListType } from './getListsStats';
import { AbilityType, getAbilityList } from './getAbilities';
import { getGear } from './getGear';
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

    const sections = getSections(rawStatBlock);
    let importedActor: ParsedActor = {
      name: getName(rawStatBlock),
      biography: getBio(rawStatBlock, sections),
      attributes: getAttributes(sections),
      skills: getSkills(sections),
      pace: getDerivedStats(sections, DerivedStatType.Pace),
      toughness: getToughness(sections),
      parry: getDerivedStats(sections, DerivedStatType.Parry),
      powerPoints: getDerivedStats(sections, DerivedStatType.PowerPoints),
      edges: getListStat(sections, ListType.Edges),
      hindrances: getListStat(sections, ListType.Hindrances),
      powers: getListStat(sections, ListType.Powers),
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
