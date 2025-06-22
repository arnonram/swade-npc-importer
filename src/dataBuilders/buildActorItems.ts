import * as itemBuilder from './itemBuilders';
import { specialAbilitiesParser } from './buildActorItemsSpecialAbilities';
import { itemGearBuilder } from './buildActorGear';
import { ParsedActor } from '../types/importedActor';
import { foundryI18nLocalize } from '../utils/foundryWrappers';

export async function buildActorItems(parsedData: ParsedActor) {
  let items: any[] = [];
  const skills = (await itemBuilder.skillBuilder(parsedData.skills)) ?? [];
  const edges = (await itemBuilder.edgeBuilder(parsedData.edges)) ?? [];
  const hindrances =
    (await itemBuilder.hindranceBuilder(parsedData.hindrances)) ?? [];
  const powers =
    (await itemBuilder.powerBuilder(parsedData.powers ?? [])) ?? [];
  const specialAbilities = await specialAbilitiesParser(
    parsedData.specialAbilities,
  );
  const gear = (await itemGearBuilder(parsedData.gear ?? {})) ?? [];

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
      item => item.name === foundryI18nLocalize('npcImporter.parser.Brute'),
    ) &&
    actorItems.find(
      item => item.name === foundryI18nLocalize('npcImporter.parser.Athletics'),
    )
  ) {
    actorItems.find(item => {
      if (item.name === foundryI18nLocalize('npcImporter.parser.Athletics')) {
        item.system.attribute = 'strength';
      }
    });
  }
  return actorItems;
}
