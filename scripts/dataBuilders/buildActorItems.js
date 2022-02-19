import * as itemBuilder from './itemBuilder.js';
import { specialAbilitiesParser as specialAbilitiesParser } from './buildActorItemsSpecialAbilities.js';
import { ItemGearBuilder as itemGearBuilder } from './buildActorGear.js';

export async function buildActorItems(parsedData) {
  let items = [];
  let skills = (await itemBuilder.skillBuilder(parsedData.Skills)) ?? [];
  let edges = (await itemBuilder.edgeBuilder(parsedData.Edges)) ?? [];
  let hindrances =
    (await itemBuilder.hindranceBuilder(parsedData.Hindrances)) ?? [];
  let powers = (await itemBuilder.powerBuilder(parsedData.Powers)) ?? [];
  let specialAbilities =
    (await specialAbilitiesParser(parsedData.SpecialAbilities)) ?? [];
  let gear = (await itemGearBuilder(parsedData.Gear)) ?? [];

  items = items.concat(
    skills,
    edges,
    hindrances,
    powers,
    specialAbilities,
    gear
  );
  return postProcessChecks(items);
}

function postProcessChecks(actorItems) {
  let finalItems = checkBruteEdge(actorItems);
  return finalItems;
}

function checkBruteEdge(actorItems) {
  if (
    actorItems.find(
      item => item.name === game.i18n.localize('npcImporter.parser.Brute')
    ) &&
    actorItems.find(
      item => item.name === game.i18n.localize('npcImporter.parser.Athletics')
    )
  ) {
    actorItems.find(item => {
      if (item.name === game.i18n.localize('npcImporter.parser.Athletics')) {
        item.data.attribute = 'strength';
      }
    });
  }
  return actorItems;
}
