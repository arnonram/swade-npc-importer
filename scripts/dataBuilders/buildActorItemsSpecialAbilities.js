import {
  abilityBuilder,
  armorBuilder,
  itemBuilderFromSpecAbs,
  weaponBuilder,
} from './itemBuilder.js';
import {
  settingallAsSpecialAbilities,
  settingModifiedSpecialAbs,
} from '../global.js';
import { getArmorBonus } from '../utils/parserBuilderHelpers.js';
import { getModuleSettings } from '../utils/foundryActions.js';

export async function specialAbilitiesParser(specialAbilitiesData) {
  const meleeDamageRegex = new RegExp(
    `${game.i18n.localize('npcImporter.parser.Str')}\\.|${game.i18n.localize(
      'npcImporter.parser.Str'
    )}(\\s?[\\+\\-]\\s?(\\d+)?X?(\\d+)?){0,}`.replace(
      'X',
      game.i18n.localize('npcImporter.parser.dice')
    ),
    'gi'
  );
  let specialAbitlitiesItems = [];
  if (!getModuleSettings(settingModifiedSpecialAbs)) {
    if (getModuleSettings(settingallAsSpecialAbilities)) {
      for (const elem in specialAbilitiesData) {
        specialAbitlitiesItems.push(
          await abilityBuilder(elem, specialAbilitiesData[elem])
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
            await armorBuilder(elem, armorBonus, specialAbilitiesData[elem])
          );
        } else if (
          (meleeDamageRegex.test(specialAbilitiesData[elem]) ||
            new RegExp(game.i18n.localize('npcImporter.regex.dice'), 'i').test(
              specialAbilitiesData[elem]
            )) &&
          elem.toLocaleLowerCase() !=
            game.i18n.localize('npcImporter.parser.Speed').toLocaleLowerCase()
        ) {
          let meleeDamage =
            specialAbilitiesData[elem].match(meleeDamageRegex) ||
            specialAbilitiesData[elem].match(
              new RegExp(game.i18n.localize('npcImporter.regex.dice'), 'i')
            );
          specialAbitlitiesItems.push(
            await weaponBuilder({
              weaponName: elem,
              weaponDescription: specialAbilitiesData[elem],
              weaponDamage: meleeDamage[0],
            })
          );
        } else {
          specialAbitlitiesItems.push(
            await abilityBuilder(elem, specialAbilitiesData[elem])
          );
        }
      }
    }
  } else {
    for (const elem in specialAbilitiesData) {
      if (elem.startsWith('@w')) {
        let meleeDamage =
          specialAbilitiesData[elem].match(meleeDamageRegex) ||
          specialAbilitiesData[elem].match(
            new RegExp(game.i18n.localize('npcImporter.regex.dice'), 'i')
          );
        let name = elem.replace('@w', '').trim();
        specialAbitlitiesItems.push(
          await weaponBuilder({
            weaponName: name,
            weaponDescription: specialAbilitiesData[elem],
            weaponDamage: meleeDamage ? meleeDamage[0] : '',
          })
        );
      } else if (elem.startsWith('@a')) {
        let armorBonus = getArmorBonus(elem);
        let name = elem.replace('@a', '').trim();
        specialAbitlitiesItems.push(
          await armorBuilder(name, armorBonus, specialAbilitiesData[elem])
        );
      } else if (elem.startsWith('@e')) {
        let data = [elem.replace('@e', '').trim(), specialAbilitiesData[elem]];
        specialAbitlitiesItems.push(
          await itemBuilderFromSpecAbs(data[0], data[1], 'edge')
        );
      } else if (elem.startsWith('@h')) {
        let data = [elem.replace('@h', '').trim(), specialAbilitiesData[elem]];
        specialAbitlitiesItems.push(
          await itemBuilderFromSpecAbs(data[0], data[1], 'hindrance')
        );
      } else if (elem.startsWith('@sa')) {
        let data = [elem.replace('@sa', '').trim(), specialAbilitiesData[elem]];
        specialAbitlitiesItems.push(await abilityBuilder(data[0], data[1]));
      }
    }
  }

  return specialAbitlitiesItems;
}
