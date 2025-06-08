import {
  getItemFromCompendium,
  getModuleSettings,
  getSpecificAdditionalStat,
  getSystemCoreSkills,
} from '../utils/foundryActions.js';
import { log, twoHandsNotaiton } from '../global.js';
import {
  capitalizeEveryWord,
  spcialAbilitiesLink,
} from '../utils/textUtils.js';

export async function skillBuilder(skillsDict) {
  const coreSkills = getSystemCoreSkills();
  if (skillsDict != undefined) {
    var allSkills = [];
    for (const skillName in skillsDict) {
      const item = await checkforItem(skillName, 'skill');
      const isCore = coreSkills.includes(skillName);
      try {
        allSkills.push({
          ...(item ?? ''),
          type: 'skill',
          name: capitalizeEveryWord(skillName),
          img: item?.img ?? 'systems/swade/assets/icons/skill.svg',
          system: {
            ...(item?.system ?? ''),
            description: item?.system?.description ?? '',
            notes: item?.system?.notes ?? '',
            additionalStats: item?.system?.additionalStats ?? {},
            attribute: item?.system?.attribute ?? '',
            isCoreSkill: isCore,
            die: {
              sides: skillsDict[skillName].die.sides,
              modifier: skillsDict[skillName].die.modifier,
            },
          },
          effects: item?.effects?.toJSON() ?? [],
          flags: item?.flags ?? {},
        });
      } catch (error) {
        log(`Could not build skill: ${error}`);
      }
    }
    return allSkills;
  }
}

export async function edgeBuilder(edges) {
  if (edges != undefined) {
    var allEdges = [];
    for (let i = 0; i < edges.length; i++) {
      let edgeName = edges[i].trim();
      const item = await checkforItem(edgeName, 'edge');
      try {
        allEdges.push({
          ...(item ?? ''),
          type: 'edge',
          name: capitalizeEveryWord(edgeName),
          img: item?.img ?? 'systems/swade/assets/icons/edge.svg',
          system: {
            ...(item?.system ?? ''),
            description: item?.system?.description ?? '',
            notes: item?.system?.notes ?? '',
            additionalStats: item?.system?.additionalStats ?? {},
            isArcaneBackground:
              item?.system?.isArcaneBackground ??
              new RegExp(game.i18n.localize('npcImporter.parser.Arcane')).test(
                edgeName,
              ),
            requirements: {
              value: item?.system?.requirements?.value ?? '',
            },
          },
          effects: item?.effects?.toJSON() ?? [],
          flags: item?.flags ?? {},
        });
      } catch (error) {
        log(`Could not build edge: ${error}`);
      }
    }
    return allEdges;
  }
}

export async function hindranceBuilder(hindrances) {
  const majorMinor = new RegExp(
    `${game.i18n.localize(
      'npcImporter.parser.Major',
    )}(,)?\\s?|${game.i18n.localize('npcImporter.parser.Minor')}(,)?\\s?`,
    'ig',
  );
  if (hindrances != undefined) {
    var allHindrances = [];
    for (let i = 0; i < hindrances.length; i++) {
      let hindranceName = hindrances[i].trim();
      let isMajor = RegExp(
        `\\(${game.i18n.localize('npcImporter.parser.Major')}`,
        'ig',
      ).test(hindranceName);
      hindranceName = hindranceName
        .replace(majorMinor, '')
        .replace('()', '')
        .trim();
      const item = await checkforItem(hindranceName, 'hindrance');
      try {
        allHindrances.push({
          ...(item ?? ''),
          type: 'hindrance',
          name: capitalizeEveryWord(hindranceName),
          img: item?.img ?? 'systems/swade/assets/icons/hindrance.svg',
          system: {
            ...(item?.system ?? ''),
            description: item?.system?.description ?? '',
            notes: item?.system?.notes ?? '',
            additionalStats: item?.system?.additionalStats ?? {},
            major: isMajor,
          },
          effects: item?.effects?.toJSON() ?? [],
          flags: item?.flags ?? {},
        });
      } catch (error) {
        log(`Could not build hindrance: ${error}`);
      }
    }

    return allHindrances;
  }
}

export async function abilityBuilder(abilityName, abilityDescription) {
  const doesGrantPowers = new RegExp(
    `${game.i18n.localize(
      'npcImporter.parser.PowerPoints',
    )}|${game.i18n.localize('npcImporter.parser.Powers')}`,
  ).test(abilityDescription);
  const item = await checkforItem(abilityName, 'ability');
  try {
    return {
      ...(item ?? ''),
      type: 'ability',
      name: capitalizeEveryWord(abilityName),
      img: item?.img ?? 'systems/swade/assets/icons/ability.svg',
      system: {
        ...(item?.system ?? ''),
        description: generateDescription(abilityDescription, item, true),
        notes: item?.system?.notes ?? '',
        additionalStats: item?.system?.additionalStats ?? {},
        subtype: 'special',
        grantsPowers: item?.system?.grantsPowers ?? doesGrantPowers,
      },
      effects: item?.effects?.toJSON() ?? [],
      flags: item?.flags ?? {},
    };
  } catch (error) {
    log(`Could not build ability: ${error}`);
  }
}

export async function itemBuilderFromSpecAbs(name, itemDescription, type) {
  let cleanName = checkSpecificItem(name).trim();
  let itemData = await checkforItem(cleanName, type);
  const item = {
    ...(itemData ?? ''),
    type: type,
    name: itemData?.name ?? capitalizeEveryWord(name.trim()),
    img: itemData?.img ?? `systems/swade/assets/icons/${type}.svg`,
    system: {
      ...abilityBuilder(itemData?.system ?? ''),
    },
    effects: itemData?.effects?.toJSON() ?? [],
    flags: itemData?.flags ?? {},
  };
  if (itemData?.type === type) {
    item.system.description = `${itemDescription.trim()}<hr>${
      itemData?.system?.description
    }`;
  }
  return item;
}

export async function powerBuilder(powers) {
  if (powers != undefined) {
    var allPowers = [];
    for (let i = 0; i < powers.length; i++) {
      let powerName = powers[i].trim();
      const powerTrapping = powers[i].match(/\(([^)]+)\)/);
      if (powerTrapping) {
        powerName = powers[i].replace(powerTrapping[0], '').trim();
      }

      let item = await getItemFromCompendium(powerName, 'power');
      if (!item || foundry.utils.isEmpty(item.system)) {
        item = await getItemFromCompendium(
          powerName.replace('/', ' / '),
          'power',
        );
      }
      let system = item?.system ? structuredClone(item.system) : {};
      if (powerTrapping) {
        system.trapping = powerTrapping[1];
      }
      try {
        let itemToAdd = {
          ...(item ?? ''),
          type: 'power',
          name: `${item?.system?.parent?.name ?? item?.name ?? powerName} ${
            powerTrapping ? powerTrapping[0] : ''
          }`.trim(),
          img: item?.img ?? 'systems/swade/assets/icons/power.svg',
          system,
          effects: item?.effects?.toJSON() ?? [],
          flags: item?.flags ?? {},
        };
        allPowers.push(itemToAdd);
      } catch (error) {
        log(`Could not build power: ${error}`);
      }
    }
    return allPowers;
  }
}

export async function weaponBuilder({
  weaponName,
  weaponDescription,
  weaponDamage,
  range,
  rof,
  ap,
  shots,
}) {
  const dmg = weaponDamage
    ?.replace(
      new RegExp(
        `${game.i18n.localize(
          'npcImporter.parser.Str',
        )}\\.|${game.i18n.localize('npcImporter.parser.Str')}`,
        'gi',
      ),
      '@str',
    )
    .replace(game.i18n.localize('npcImporter.parser.dice'), 'd');
  const item = await getItemFromCompendium(weaponName, 'weapon');
  //todo Improve this so that it'll add multiple entries for weapons which are ranged && melee
  const actions = item?.system?.actions ?? {
    skill: range
      ? game.i18n.localize('npcImporter.parser.Shooting')
      : game.i18n.localize('npcImporter.parser.Fighting'),
  };
  try {
    return {
      ...(item ?? ''),
      type: 'weapon',
      name: item?.name ?? capitalizeEveryWord(weaponName),
      img: item?.img ?? 'systems/swade/assets/icons/weapon.svg',
      system: {
        ...(item?.system ?? ''),
        description: generateDescription(weaponDescription, item),
        equippable: item?.system?.equippable ?? true,
        equipStatus: checkEquipedStatus(item?.system),
        damage: dmg,
        range: range ?? item?.system?.range,
        rof: rof ?? item?.system?.rof,
        ap: ap ?? item?.system?.ap,
        shots: shots ?? item?.system?.shots,
        currentShots: shots ?? item?.system?.shots,
        actions: actions,
      },
      effects: item?.effects?.toJSON() ?? [],
      flags: item?.flags ?? {},
    };
  } catch (error) {
    log(`Could not build weapon: ${error}`);
  }
}

export async function shieldBuilder(
  shieldName,
  description,
  parry = 0,
  cover = 0,
) {
  const item = await getItemFromCompendium(shieldName, 'shield');
  try {
    return {
      ...(item ?? ''),
      type: 'shield',
      name: item?.name ?? capitalizeEveryWord(shieldName),
      img: item?.img ?? 'systems/swade/assets/icons/shield.svg',
      system: {
        ...(item?.system ?? ''),
        description: generateDescription(description, item),
        notes: item?.system?.notes ?? '',
        additionalStats: item?.system?.additionalStats ?? {},
        equipStatus: 3,
        equippable: true,
        parry: item?.system?.parry ?? parry,
        cover: item?.system?.cover ?? cover,
      },
      effects: item?.effects?.toJSON() ?? [],
      flags: item?.flags ?? {},
    };
  } catch (error) {
    log(`Could not build shield: ${error}`);
  }
}

export async function armorBuilder(armorName, armorBonus, armorDescription) {
  var cleanName = checkSpecificItem(armorName);
  const item = await getItemFromCompendium(cleanName, 'armor');
  try {
    return {
      ...(item ?? ''),
      type: 'armor',
      name: item?.name ?? capitalizeEveryWord(armorName),
      img: item?.img ?? 'systems/swade/assets/icons/armor.svg',
      system: {
        ...(item?.system ?? ''),
        description: generateDescription(armorDescription, item),
        notes: item?.system?.notes ?? '',
        additionalStats: item?.system?.additionalStats ?? {},
        equipStatus: 3,
        equippable: true,
        armor: item?.system?.armor ?? armorBonus,
      },
      effects: item?.effects?.toJSON() ?? [],
      flags: item?.flags ?? {},
    };
  } catch (error) {
    log(`Could not build armor: ${error}`);
  }
}

export async function gearBuilder(gearName, description) {
  const item = await checkforItem(gearName, 'gear');
  try {
    return {
      ...(item ?? ''),
      type: 'gear',
      name: item?.name ?? capitalizeEveryWord(gearName),
      img: item?.img ?? 'systems/swade/assets/icons/gear.svg',
      system: {
        ...(item?.system ?? ''),
        description: generateDescription(description, item),
        equipStatus: 1,
        equippable: false,
      },
      effects: item?.effects?.toJSON() ?? [],
      flags: item?.flags ?? {},
    };
  } catch (error) {
    log(`Could not build gear: ${error}`);
  }
}

export function additionalStatsBuilder(
  additionalStatName,
  additionalStatValue,
) {
  let gameAditionalStat = getSpecificAdditionalStat(additionalStatName);
  if (gameAditionalStat !== undefined) {
    gameAditionalStat['value'] = additionalStatValue;
    return gameAditionalStat;
  }
}

function checkSpecificItem(data) {
  const abilitiesWithMod = new RegExp(
    `${game.i18n.localize('npcImporter.parser.Armor')}|${game.i18n.localize(
      'npcImporter.parser.Size',
    )}|${game.i18n.localize('npcImporter.parser.Fear')}|${game.i18n.localize(
      'npcImporter.parser.Weakness',
    )}$`,
  );

  const item = data.match(abilitiesWithMod);

  if (item != null) {
    return item[0];
  }
  return data;
}

async function checkforItem(itemName, itemType) {
  if (itemType === 'edge') {
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
      itemName.split('(')[0].replace(new RegExp('[+-−]?\\d'), '').trim(),
      itemType,
    );
  }
  return itemFromCompendium;
}

function rearrangeImprovedEdges(edgeName) {
  let edge = edgeName;
  if (edgeName.includes(game.i18n.localize('npcImporter.parser.Imp'))) {
    edge = edgeName
      .replace(game.i18n.localize('npcImporter.parser.Imp'), '')
      .trim();
    edge = `${game.i18n.localize('npcImporter.parser.Improved')} ${edge}`;
  }
  return edge;
}

function generateDescription(description, itemData, isSpecialAbility) {
  let desc;
  if (description && isSpecialAbility && itemData?.name) {
    desc = `${description.trim()}<br>${spcialAbilitiesLink(itemData.name)}`;
  }
  if (description) {
    return itemData?.system?.description
      ? `${desc ?? description}<hr>${itemData?.system?.description}`
      : description;
  } else return '';
}

function checkEquipedStatus(weaponData) {
  var regEx = new RegExp(getModuleSettings(twoHandsNotaiton), 'i');
  return regEx.test(weaponData?.description) || regEx.test(weaponData?.notes)
    ? 5
    : 4;
}
