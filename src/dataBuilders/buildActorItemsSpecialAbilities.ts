import {
  abilityBuilder,
  armorBuilder,
  itemBuilderFromSpecAbs,
  weaponBuilder,
} from './itemBuilders';
import {
  settingallAsSpecialAbilities,
  settingModifiedSpecialAbs,
} from '../global';
import { getModuleSettings } from '../utils/foundryActions';
import { foundryI18nLocalize } from '../utils/foundryWrappers';
import { getArmorBonus } from '../statBlockParser/parserBuilderHelpers';
import { ItemType } from '../../src/types/enums';

function parseArmorAbility(elem: string, desc: string) {
  const armorBonus = getArmorBonus(elem);
  return armorBuilder(elem, armorBonus, desc);
}

function parseWeaponAbility(
  elem: string,
  desc: string,
  meleeDamageRegex: RegExp,
) {
  const meleeDamage =
    desc.match(meleeDamageRegex) ||
    desc.match(new RegExp(foundryI18nLocalize('npcImporter.regex.dice'), 'i'));
  return weaponBuilder({
    weaponName: elem,
    weaponDescription: desc,
    weaponDamage: meleeDamage ? meleeDamage[0] : '',
  });
}

function parseItemByPrefix(
  prefix: string,
  elem: string,
  desc: string,
  meleeDamageRegex: RegExp,
) {
  switch (prefix) {
    case '@w': {
      const name = elem.replace('@w', '').trim();
      const meleeDamage =
        desc.match(meleeDamageRegex) ||
        desc.match(
          new RegExp(foundryI18nLocalize('npcImporter.regex.dice'), 'i'),
        );
      return weaponBuilder({
        weaponName: name,
        weaponDescription: desc,
        weaponDamage: meleeDamage ? meleeDamage[0] : '',
      });
    }
    case '@a': {
      const name = elem.replace('@a', '').trim();
      const armorBonus = getArmorBonus(elem);
      return armorBuilder(name, armorBonus, desc);
    }
    case '@e': {
      const name = elem.replace('@e', '').trim();
      return itemBuilderFromSpecAbs(name, desc, ItemType.EDGE);
    }
    case '@h': {
      const name = elem.replace('@h', '').trim();
      return itemBuilderFromSpecAbs(name, desc, ItemType.HINDRANCE);
    }
    case '@sa': {
      const name = elem.replace('@sa', '').trim();
      return abilityBuilder(name, desc);
    }
    default:
      return null;
  }
}

export async function specialAbilitiesParser(
  specialAbilitiesData: Record<string, string> | undefined,
): Promise<any[]> {
  // Regex: matches Str, Str., Str+4, Str -2, Str+d6, Str+2d8, Str + 1d6, Str+d4 (case-insensitive)
  const meleeDamageRegex = /str\.?\s*([+\-]\s*((\d+)?d\d+|\d+))?/i;
  if (!specialAbilitiesData) return [];
  let specialAbilitiesItems: any[] = [];
  if (!getModuleSettings(settingModifiedSpecialAbs)) {
    if (getModuleSettings(settingallAsSpecialAbilities)) {
      specialAbilitiesItems = await Promise.all(
        Object.entries(specialAbilitiesData).map(([elem, desc]) =>
          abilityBuilder(elem, desc),
        ),
      );
    } else {
      specialAbilitiesItems = await Promise.all(
        Object.entries(specialAbilitiesData).map(async ([elem, desc]) => {
          elem = elem.toLocaleLowerCase().trim();
          if (
            elem.startsWith(
              foundryI18nLocalize(
                'npcImporter.parser.Armor',
              ).toLocaleLowerCase(),
            )
          ) {
            return parseArmorAbility(elem, desc);
          } else if (isWeaponAbility(elem, desc, meleeDamageRegex)) {
            return parseWeaponAbility(elem, desc, meleeDamageRegex);
          } else {
            return abilityBuilder(elem, desc);
          }
        }),
      );
    }
  } else {
    specialAbilitiesItems = await Promise.all(
      Object.entries(specialAbilitiesData).map(async ([elem, desc]) => {
        const prefix = ['@w', '@a', '@e', '@h', '@sa']
          .find(p => elem.startsWith(p))
          ?.trim();
        if (prefix) {
          return parseItemByPrefix(prefix, elem, desc, meleeDamageRegex);
        }
        // Skip unknown prefixes (e.g., @x)
        if (elem.startsWith('@')) return null;
        return null;
      }),
    );
  }
  return specialAbilitiesItems.filter(Boolean);
}

function isWeaponAbility(
  elem: string,
  desc: string,
  meleeDamageRegex: RegExp,
): boolean {
  const isMeleeOrDice =
    meleeDamageRegex.test(desc) ||
    new RegExp(foundryI18nLocalize('npcImporter.regex.dice'), 'i').test(desc);

  const isSpeed =
    elem ===
    foundryI18nLocalize('npcImporter.parser.Speed').toLocaleLowerCase();
  const hasRunningDie = desc.includes(
    foundryI18nLocalize('npcImporter.parser.RunningDie').toLocaleLowerCase(),
  );

  return isMeleeOrDice && !isSpeed && !hasRunningDie;
}
