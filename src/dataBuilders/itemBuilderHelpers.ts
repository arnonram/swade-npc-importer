import { foundryI18nLocalize } from '../utils/foundryWrappers';
import {
  getModuleSettings,
  getItemFromCompendium,
} from '../utils/foundryActions';
import { twoHandsNotaiton } from '../global';
import { specialAbilitiesLink } from '../utils/textUtils';
import { ItemType } from '../../src/types/enums';

export function checkSpecificItem(data: string) {
  const abilitiesWithMod = new RegExp(
    `${foundryI18nLocalize('npcImporter.parser.Armor')}|${foundryI18nLocalize('npcImporter.parser.Size')}|${foundryI18nLocalize('npcImporter.parser.Fear')}|${foundryI18nLocalize('npcImporter.parser.Weakness')}$`,
  );
  const item = data.match(abilitiesWithMod);
  if (item != null) {
    return item[0];
  }
  return data;
}

export function rearrangeImprovedEdges(edgeName: string): string {
  let edge = edgeName;
  if (edgeName.includes(foundryI18nLocalize('npcImporter.parser.Imp'))) {
    edge = edgeName
      .replace(foundryI18nLocalize('npcImporter.parser.Imp'), '')
      .trim();
    edge = `${foundryI18nLocalize('npcImporter.parser.Improved')} ${edge}`;
  }
  return edge;
}

export function generateDescription(
  description: string,
  itemData: { name: string; system: { description: any } },
  isSpecialAbility?: boolean,
) {
  let desc;
  if (description && isSpecialAbility && itemData?.name) {
    desc = `${description.trim()}<br>${specialAbilitiesLink(itemData.name)}`;
  }
  if (description) {
    return itemData?.system?.description
      ? `${desc ?? description}<hr>${itemData?.system?.description}`
      : description;
  } else return '';
}

export function checkEquipedStatus(weaponData: {
  description: string;
  notes: string;
}) {
  var regEx = new RegExp(getModuleSettings(twoHandsNotaiton), 'i');
  return regEx.test(weaponData?.description) || regEx.test(weaponData?.notes)
    ? 5
    : 4;
}

export async function checkforItem(itemName: string, itemType: ItemType) {
  if (itemType === ItemType.EDGE) {
    itemName = rearrangeImprovedEdges(itemName);
  }
  let itemFromCompendium = await getItemFromCompendium(itemName, itemType);
  if (!foundry.utils.isEmpty(itemFromCompendium.system))
    return itemFromCompendium;

  itemFromCompendium = await getItemFromCompendium(
    itemName.split('(')[0].trim(),
    itemType,
  );

  if (foundry.utils.isEmpty(itemFromCompendium.system)) {
    itemFromCompendium = await getItemFromCompendium(
      itemName.split('(')[0].replace(new RegExp('[+-]?\\d'), '').trim(),
      itemType,
    );
  }
  return itemFromCompendium;
}
