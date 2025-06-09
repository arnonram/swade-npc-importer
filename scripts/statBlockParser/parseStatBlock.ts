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
} from './getDerivedStats';

export async function statBlockParser(
  rarStatBlock: string,
): Promise<ParsedActor> {
  try {
    console.log(`Starting statblock parsing`);

    let sections = getSections(rarStatBlock);
    var importedActor: ParsedActor = {
      name: getName(rarStatBlock),
      biography: getBio(rarStatBlock, sections),
      attributes: getAttributes(sections),
      skills: getSkills(sections),
      pace: getDerivedStats(sections, DerivedStatType.Pace),
      toughness: getDerivedStats(sections, DerivedStatType.Toughness),
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
    importedActor.size = getSize(importedActor.specialAbilities);

    if (!importedActor.powerPoints && importedActor.specialAbilities) {
      importedActor.powerPoints = powerPointsFromSpecialAbility(
        importedActor.specialAbilities,
      );
    }

    console.info(`Parsed data: ${JSON.stringify(importedActor, null, 4)}`);
    return importedActor;
  } catch (error) {
    console.error(`Failed to parse: ${error}`);
    ui.notifications?.error(
      game.i18n?.localize('npcImporter.parser.NotValidStablock') as string,
    );
    return {} as ParsedActor;
  }
}
