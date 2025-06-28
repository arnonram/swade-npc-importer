import { foundryI18nLocalize } from '../utils/foundryWrappers';
import {
  getModuleSettings,
  getItemFromCompendium,
} from '../utils/foundryActions';
import { twoHandsNotaiton } from '../global';
import { specialAbilitiesLink } from '../utils/textUtils';
import { ItemType } from '../../src/types/enums';
import { isEmpty } from '../utils/objectUtils';

/**
 * Checks for a specific item name pattern and returns the matched or original string.
 * @param data - The item name string to check.
 * @returns The matched item name or the original string.
 */
export function checkSpecificItem(data: string): string {
  const abilitiesWithMod = new RegExp(
    `${foundryI18nLocalize('npcImporter.parser.Armor')}|${foundryI18nLocalize('npcImporter.parser.Size')}|${foundryI18nLocalize('npcImporter.parser.Fear')}|${foundryI18nLocalize('npcImporter.parser.Weakness')}$`,
  );
  const item = data.match(abilitiesWithMod);
  if (item != null) {
    return item[0];
  }
  return data;
}

/**
 * Rearranges improved edge names to a standard format.
 * @param edgeName - The edge name string to rearrange.
 * @returns The rearranged edge name.
 */
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

/**
 * Generates a description for an item, optionally as a special ability.
 * @param description - The base description string.
 * @param itemData - The item data object.
 * @param isSpecialAbility - Whether this is a special ability.
 * @returns The generated description string.
 */
export function generateDescription(
  description: string,
  itemData: { name: string; system: { description: any } },
  isSpecialAbility?: boolean,
): string {
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

/**
 * Checks the equipped status of a weapon based on its description and notes.
 * @param weaponData - The weapon data object.
 * @returns The equipped status code.
 */
export function checkEquipedStatus(weaponData: {
  description: string;
  notes: string;
}): number {
  var regEx = new RegExp(getModuleSettings(twoHandsNotaiton), 'i');
  return regEx.test(weaponData?.description) || regEx.test(weaponData?.notes)
    ? 5
    : 4;
}

/**
 * Looks up an item from the compendium, handling edge cases for names and types.
 * @param itemName - The name of the item to look up.
 * @param itemType - The type of the item.
 * @returns The found item object or undefined.
 */
export async function checkforItem(
  itemName: string,
  itemType: ItemType,
): Promise<any> {
  if (itemType === ItemType.EDGE) {
    itemName = rearrangeImprovedEdges(itemName);
  }
  let itemFromCompendium = await getItemFromCompendium(itemName, itemType);
  if (!isEmpty(itemFromCompendium.system)) return itemFromCompendium;

  itemFromCompendium = await getItemFromCompendium(
    itemName.split('(')[0].trim(),
    itemType,
  );

  if (isEmpty(itemFromCompendium.system)) {
    itemFromCompendium = await getItemFromCompendium(
      itemName.split('(')[0].replace(new RegExp('[+-]?\\d'), '').trim(),
      itemType,
    );
  }
  return itemFromCompendium;
}

/**
 * Helper to build a Foundry item object with merged defaults and overrides.
 * @param params - The parameters for building the item object.
 * @returns The constructed item object.
 */
export function buildItemObject({
  item,
  type,
  name,
  img,
  system,
}: {
  item: any;
  type: ItemType;
  name: string;
  img: string;
  system: any;
}): any {
  return {
    ...(item ?? {}),
    type,
    name,
    img: item?.img ?? img,
    system: { ...(item?.system ?? {}), ...system },
    effects: item?.effects?.toJSON() ?? [],
    flags: item?.flags ?? {},
  };
}
