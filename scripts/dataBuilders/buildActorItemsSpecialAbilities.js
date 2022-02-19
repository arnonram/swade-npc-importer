import {
  AbilityBuilder,
  ArmorBuilder,
  ItemBuilderFromSpecAbs,
  WeaponBuilder,
} from './itemBuilder.js';
import {
  diceRegex,
  settingallAsSpecialAbilities,
  settingModifiedSpecialAbs,
} from '../global.js';
import { getArmorBonus } from '../utils/parserBuilderHelpers.js';
import { getModuleSettings } from '../utils/foundryActions.js';

export async function specialAbilitiesParser(specialAbilitiesData) {
  const meleeDamageRegex = new RegExp(
    `\\b${game.i18n.localize(
      'npcImporter.parser.Str'
    )}\\.\\b|\\b${game.i18n.localize(
      'npcImporter.parser.Str'
    )}\\b(\\s?[\\+\\-]\\s?(\\d+)?d?(\\d+)?){0,}`,
    'gi'
  );
  let specialAbitlitiesItems = [];
  if (!getModuleSettings(settingModifiedSpecialAbs)) {
    if (getModuleSettings(settingallAsSpecialAbilities)) {
      for (const elem in specialAbilitiesData) {
        specialAbitlitiesItems.push(
          await AbilityBuilder(elem, specialAbilitiesData[elem])
        );
      }
    } else {
      for (const elem in specialAbilitiesData) {
        if (
          elem
            .toLocaleLowerCase()
            .startsWith(
              game.i18n.localize('npcImporter.parser.Armor').toLocaleLowerCase()
            )
        ) {
          let armorBonus = getArmorBonus(elem);
          specialAbitlitiesItems.push(
            await ArmorBuilder(elem, armorBonus, specialAbilitiesData[elem])
          );
        } else if (
          (meleeDamageRegex.test(specialAbilitiesData[elem]) ||
            diceRegex.test(specialAbilitiesData[elem])) &&
          elem.toLocaleLowerCase() !=
            game.i18n.localize('npcImporter.parser.Speed').toLocaleLowerCase()
        ) {
          let meleeDamage =
            specialAbilitiesData[elem].match(meleeDamageRegex) ||
            specialAbilitiesData[elem].match(diceRegex);
          specialAbitlitiesItems.push(
            await WeaponBuilder({
              weaponName: elem,
              weaponDescription: specialAbilitiesData[elem],
              weaponDamage: meleeDamage[0],
            })
          );
        } else {
          specialAbitlitiesItems.push(
            await AbilityBuilder(elem, specialAbilitiesData[elem])
          );
        }
      }
    }
  } else {
    for (const elem in specialAbilitiesData) {
      if (elem.startsWith('@w')) {
        let meleeDamage =
          specialAbilitiesData[elem].match(meleeDamageRegex) ||
          specialAbilitiesData[elem].match(diceRegex);
        let name = elem.replace('@w', '').trim();
        specialAbitlitiesItems.push(
          await WeaponBuilder({
            weaponName: name,
            weaponDescription: specialAbilitiesData[elem],
            weaponDamage: meleeDamage[0],
          })
        );
      } else if (elem.startsWith('@a')) {
        let armorBonus = getArmorBonus(elem);
        let name = elem.replace('@a', '').trim();
        specialAbitlitiesItems.push(
          await ArmorBuilder(name, armorBonus, specialAbilitiesData[elem])
        );
      } else if (elem.startsWith('@e')) {
        let data = [elem.replace('@e', '').trim(), specialAbilitiesData[elem]];
        specialAbitlitiesItems.push(
          await ItemBuilderFromSpecAbs(data[0], data[1], 'edge')
        );
      } else if (elem.startsWith('@h')) {
        let data = [elem.replace('@h', '').trim(), specialAbilitiesData[elem]];
        specialAbitlitiesItems.push(
          await ItemBuilderFromSpecAbs(data[0], data[1], 'hindrance')
        );
      } else if (elem.startsWith('@sa')) {
        let data = [elem.replace('@sa', '').trim(), specialAbilitiesData[elem]];
        specialAbitlitiesItems.push(await AbilityBuilder(data[0], data[1]));
      }
    }
  }

  return specialAbitlitiesItems;
}
