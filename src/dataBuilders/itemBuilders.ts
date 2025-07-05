import {
  getItemFromCompendium,
  getSystemCoreSkills,
} from '../utils/foundryActions';
import { capitalizeEveryWord } from '../utils/textUtils';
import { WeaponBuilderProps } from '../types/actorToImport';
import { Logger } from '../utils/logger';
import { foundryI18nLocalize } from '../utils/foundryWrappers';
import { ItemType } from '../../src/types/enums';
import {
  checkSpecificItem,
  generateDescription,
  checkEquipedStatus,
  checkforItem,
  buildItemObject,
} from './itemBuilderHelpers';
import { isEmpty } from '../utils/objectUtils';

export async function skillBuilder(
  skillsDict: Record<string, any>,
): Promise<any[]> {
  if (!skillsDict) return [];
  const coreSkills = getSystemCoreSkills();
  const allSkills = await Promise.all(
    Object.entries(skillsDict).map(async ([skillName, skillData]) => {
      const item = await checkforItem(skillName, ItemType.SKILL);
      const isCore = coreSkills.includes(skillName);
      try {
        return {
          ...(item ?? {}),
          type: ItemType.SKILL,
          name: capitalizeEveryWord(skillName),
          img: item?.img ?? 'systems/swade/assets/icons/skill.svg',
          system: {
            ...(item?.system ?? {}),
            description: item?.system?.description ?? '',
            notes: item?.system?.notes ?? '',
            additionalStats: item?.system?.additionalStats ?? {},
            attribute: item?.system?.attribute ?? '',
            isCoreSkill: isCore,
            die: {
              sides: skillData.sides,
              modifier: skillData.modifier,
            },
          },
          effects: item?.effects?.toJSON() ?? [],
          flags: item?.flags ?? {},
        };
      } catch (error) {
        Logger.error(`Could not build skill: ${error}`);
        return null;
      }
    }),
  );
  return allSkills.filter(Boolean);
}

export async function weaponBuilder(props: WeaponBuilderProps): Promise<any> {
  const dmg = props.weaponDamage
    .replace('.', '')
    ?.replace(
      new RegExp(`${foundryI18nLocalize('npcImporter.parser.Str')}`, 'gi'),
      '@str',
    )
    .replace(foundryI18nLocalize('npcImporter.parser.dice'), 'd');
  const item = await checkforItem(props.weaponName, ItemType.WEAPON);
  const actions = item?.system?.actions ?? {
    skill: props.range
      ? foundryI18nLocalize('npcImporter.parser.Shooting')
      : foundryI18nLocalize('npcImporter.parser.Fighting'),
  };
  try {
    return buildItemObject({
      item,
      type: ItemType.WEAPON,
      name: item?.name ?? capitalizeEveryWord(props.weaponName),
      img: 'systems/swade/assets/icons/weapon.svg',
      system: {
        description: generateDescription(props.weaponDescription || '', item),
        equippable: item?.system?.equippable ?? true,
        equipStatus: checkEquipedStatus(item?.system ?? {}),
        damage: dmg,
        range: props.range ?? item?.system?.range,
        rof: props.rof ?? item?.system?.rof,
        ap: props.ap ?? item?.system?.ap,
        shots: props.shots ?? item?.system?.shots,
        currentShots: props.shots ?? item?.system?.shots,
        actions,
      },
    });
  } catch (error) {
    Logger.error(`Could not build weapon: ${error}`);
    return null;
  }
}

export async function shieldBuilder(
  shieldName: string,
  description: string = '',
  parry: number = 0,
  cover: number = 0,
): Promise<any> {
  const item = await checkforItem(shieldName, ItemType.SHIELD);
  try {
    return buildItemObject({
      item,
      type: ItemType.SHIELD,
      name: item?.name ?? capitalizeEveryWord(shieldName),
      img: 'systems/swade/assets/icons/shield.svg',
      system: {
        description: generateDescription(description, item),
        notes: item?.system?.notes ?? '',
        additionalStats: item?.system?.additionalStats ?? {},
        equipStatus: 3,
        equippable: true,
        parry: item?.system?.parry ?? parry,
        cover: item?.system?.cover ?? cover,
      },
    });
  } catch (error) {
    Logger.error(`Could not build shield: ${error}`);
    return null;
  }
}

export async function armorBuilder(
  armorName: string,
  armorBonus: number,
  armorDescription: string,
): Promise<any> {
  const cleanName = checkSpecificItem(armorName);
  const item = await checkforItem(cleanName, ItemType.ARMOR);
  try {
    return buildItemObject({
      item,
      type: ItemType.ARMOR,
      name: item?.name ?? capitalizeEveryWord(armorName),
      img: 'systems/swade/assets/icons/armor.svg',
      system: {
        description: generateDescription(armorDescription, item),
        notes: item?.system?.notes ?? '',
        additionalStats: item?.system?.additionalStats ?? {},
        equipStatus: 3,
        equippable: true,
        armor: item?.system?.armor ?? armorBonus,
        isNaturalArmor: true,
      },
    });
  } catch (error) {
    Logger.error(`Could not build armor: ${error}`);
    return null;
  }
}

export async function gearBuilder(
  gearName: string,
  description: string = '',
): Promise<any> {
  const item = await checkforItem(gearName, ItemType.GEAR);
  try {
    return buildItemObject({
      item,
      type: ItemType.GEAR,
      name: item?.name ?? capitalizeEveryWord(gearName),
      img: 'systems/swade/assets/icons/gear.svg',
      system: {
        description: generateDescription(description, item),
        equipStatus: 1,
        equippable: false,
      },
    });
  } catch (error) {
    Logger.error(`Could not build gear: ${error}`);
    return null;
  }
}

export async function abilityBuilder(
  abilityName: string,
  abilityDescription: string = '',
): Promise<any> {
  const doesGrantPowers = new RegExp(
    `${foundryI18nLocalize('npcImporter.parser.PowerPoints')}|${foundryI18nLocalize('npcImporter.parser.Powers')}`,
  ).test(abilityDescription);
  const item = await checkforItem(abilityName, ItemType.ABILITY);
  try {
    return buildItemObject({
      item,
      type: ItemType.ABILITY,
      name: capitalizeEveryWord(abilityName),
      img: 'systems/swade/assets/icons/ability.svg',
      system: {
        description: generateDescription(abilityDescription, item, true),
        notes: item?.system?.notes ?? '',
        additionalStats: item?.system?.additionalStats ?? {},
        subtype: 'special',
        grantsPowers: item?.system?.grantsPowers ?? doesGrantPowers,
      },
    });
  } catch (error) {
    Logger.error(`Could not build ability: ${error}`);
    return null;
  }
}

export async function itemBuilderFromSpecAbs(
  name: string,
  itemDescription: string,
  type: ItemType,
): Promise<any> {
  const cleanName = checkSpecificItem(name).trim();
  const itemData = await checkforItem(cleanName, type);
  try {
    return buildItemObject({
      item: itemData,
      type,
      name: itemData?.name ?? capitalizeEveryWord(name.trim()),
      img: itemData?.img ?? `systems/swade/assets/icons/${type}.svg`,
      system: {
        description: itemData?.system?.description
          ? `${itemDescription.trim()}<hr>${itemData.system.description}`
          : itemDescription.trim(),
      },
    });
  } catch (error) {
    Logger.error(`Could not build item from spec abs: ${error}`);
    return null;
  }
}

export async function edgeBuilder(edges: string[]): Promise<any[]> {
  if (!edges) return [];
  const allEdges = await Promise.all(
    edges.map(async edge => {
      const edgeName = edge.trim();
      const item = await checkforItem(edgeName, ItemType.EDGE);
      try {
        return buildItemObject({
          item,
          type: ItemType.EDGE,
          name: capitalizeEveryWord(edgeName),
          img: 'systems/swade/assets/icons/edge.svg',
          system: {
            description: item?.system?.description ?? '',
            notes: item?.system?.notes ?? '',
            additionalStats: item?.system?.additionalStats ?? {},
            isArcaneBackground:
              item?.system?.isArcaneBackground ??
              new RegExp(foundryI18nLocalize('npcImporter.parser.Arcane')).test(
                edgeName,
              ),
            requirements: {
              value: item?.system?.requirements?.value ?? '',
            },
          },
        });
      } catch (error) {
        Logger.error(`Could not build edge: ${error}`);
        return null;
      }
    }),
  );
  return allEdges.filter(Boolean);
}

export async function hindranceBuilder(hindrances: string[]): Promise<any[]> {
  if (!hindrances) return [];
  const majorMinor = new RegExp(
    `${foundryI18nLocalize('npcImporter.parser.Major')}(,)?\\s?|${foundryI18nLocalize('npcImporter.parser.Minor')}(,)?\\s?`,
    'ig',
  );
  const allHindrances = await Promise.all(
    hindrances.map(async hindrance => {
      let hindranceName = hindrance.trim();
      const isMajor = RegExp(
        `\\(${foundryI18nLocalize('npcImporter.parser.Major')}`,
        'ig',
      ).test(hindranceName);
      hindranceName = hindranceName
        .replace(majorMinor, '')
        .replace('()', '')
        .trim();
      const item = await checkforItem(hindranceName, ItemType.HINDRANCE);
      try {
        return buildItemObject({
          item,
          type: ItemType.HINDRANCE,
          name: capitalizeEveryWord(hindranceName),
          img: 'systems/swade/assets/icons/hindrance.svg',
          system: {
            description: item?.system?.description ?? '',
            notes: item?.system?.notes ?? '',
            additionalStats: item?.system?.additionalStats ?? {},
            major: isMajor,
          },
        });
      } catch (error) {
        Logger.error(`Could not build hindrance: ${error}`);
        return null;
      }
    }),
  );
  return allHindrances.filter(Boolean);
}

export async function powerBuilder(powers: string[]): Promise<any[]> {
  if (!powers) return [];
  const allPowers = await Promise.all(
    powers.map(async power => {
      let powerName = power.trim();
      const powerTrapping = power.match(/\(([^)]+)\)/);
      if (powerTrapping) {
        powerName = power.replace(powerTrapping[0], '').trim();
      }
      let item = await getItemFromCompendium(powerName, ItemType.POWER);
      if (!item || isEmpty(item.system)) {
        item = await getItemFromCompendium(
          powerName.replace('/', ' / '),
          ItemType.POWER,
        );
      }
      let system = item?.system ? structuredClone(item.system) : {};
      if (powerTrapping) {
        system.trapping = powerTrapping[1];
      }
      try {
        return buildItemObject({
          item,
          type: ItemType.POWER,
          name: `${item?.system?.parent?.name ?? item?.name ?? powerName} ${
            powerTrapping ? powerTrapping[0] : ''
          }`.trim(),
          img: 'systems/swade/assets/icons/power.svg',
          system,
        });
      } catch (error) {
        Logger.error(`Could not build power: ${error}`);
        return null;
      }
    }),
  );
  return allPowers.filter(Boolean);
}
