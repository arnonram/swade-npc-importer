import * as itemBuilder from './itemBuilder.js';
import { specialAbilitiesParser } from './buildActorItemsSpecialAbilities.js';
import { itemGearBuilder } from './buildActorGear.js';
import { ParsedActor } from '../types/importedActor.js';

export async function buildActorItems(parsedData: ParsedActor) {
  let items: any[] = [];
  let skills = (await itemBuilder.skillBuilder(parsedData.skills)) ?? [];
  let edges = (await itemBuilder.edgeBuilder(parsedData.edges)) ?? [];
  let hindrances =
    (await itemBuilder.hindranceBuilder(parsedData.hindrances)) ?? [];
  let powers = (await itemBuilder.powerBuilder(parsedData.powers ?? [])) ?? [];
  let specialAbilities = await specialAbilitiesParser(
    parsedData.specialAbilities,
  );
  let gear = (await itemGearBuilder(parsedData.gear)) ?? [];

  items = items.concat(
    skills,
    edges,
    hindrances,
    powers,
    specialAbilities,
    gear,
  );
  return postProcessChecks(items);
}

function postProcessChecks(actorItems: any[]) {
  let finalItems = checkBruteEdge(actorItems);
  return finalItems;
}

function checkBruteEdge(actorItems: any[]) {
  if (
    actorItems.find(
      item => item.name === game.i18n?.localize('npcImporter.parser.Brute'),
    ) &&
    actorItems.find(
      item => item.name === game.i18n?.localize('npcImporter.parser.Athletics'),
    )
  ) {
    actorItems.find(item => {
      if (item.name === game.i18n?.localize('npcImporter.parser.Athletics')) {
        item.system.attribute = 'strength';
      }
    });
  }
  return actorItems;
}
