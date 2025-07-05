import * as itemBuilder from './itemBuilders';
import { specialAbilitiesParser } from './buildActorItemsSpecialAbilities';
import { itemGearBuilder } from './buildActorGear';
import { ParsedActor } from '../types/importedActor';
import { checkBruteEdge } from './buildActorDataHelpers';

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
