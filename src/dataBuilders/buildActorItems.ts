import * as itemBuilder from './itemBuilders';
import { specialAbilitiesParser } from './buildActorItemsSpecialAbilities';
import { itemGearBuilder } from './buildActorGear';
import { ParsedActor } from '../types/importedActor';
import { foundryI18nLocalize } from '../utils/foundryWrappers';

export async function buildActorItems(parsedData: ParsedActor) {
  const [skills, edges, hindrances, powers, specialAbilities, gear] =
    await Promise.all([
      itemBuilder.skillBuilder(parsedData.skills ?? {}),
      itemBuilder.edgeBuilder(parsedData.edges ?? []),
      itemBuilder.hindranceBuilder(parsedData.hindrances ?? []),
      itemBuilder.powerBuilder(parsedData.powers ?? []),
      specialAbilitiesParser(parsedData.specialAbilities),
      itemGearBuilder(parsedData.gear ?? {}),
    ]);

  const items = [
    ...(skills ?? []),
    ...(edges ?? []),
    ...(hindrances ?? []),
    ...(powers ?? []),
    ...(specialAbilities ?? []),
    ...(gear ?? []),
  ];
  return postProcessChecks(items);
}

function postProcessChecks(actorItems: any[]) {
  return checkBruteEdge(actorItems);
}

function checkBruteEdge(actorItems: any[]) {
  const bruteName = foundryI18nLocalize('npcImporter.parser.Brute');
  const athleticsName = foundryI18nLocalize('npcImporter.parser.Athletics');
  const hasBrute = actorItems.some(item => item.name === bruteName);
  const athletics = actorItems.find(item => item.name === athleticsName);
  if (hasBrute && athletics) {
    athletics.system.attribute = 'strength';
  }
  return actorItems;
}
