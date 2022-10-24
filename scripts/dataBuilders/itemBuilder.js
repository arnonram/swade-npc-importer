import {
  getItemFromCompendium,
  getSpecificAdditionalStat,
  getSystemCoreSkills,
} from '../utils/foundryActions.js';
import { log } from '../global.js';
import {
  capitalizeEveryWord,
  spcialAbilitiesLink,
} from '../utils/textUtils.js';

export async function skillBuilder(skillsDict) {
  const coreSkills = getSystemCoreSkills();
  if (skillsDict != undefined) {
    var allSkills = [];
    for (const skillName in skillsDict) {
      const { system } = await checkforItem(skillName, 'skill');
      const isCore = coreSkills.includes(skillName);
      try {
        allSkills.push({
          type: 'skill',
          name: capitalizeEveryWord(skillName),
          img: system?.img ?? 'systems/swade/assets/icons/skill.svg',
          data: {
            ...system?.data,
            description: system?.data?.description ?? '',
            notes: system?.data?.notes ?? '',
            additionalStats: system?.data?.additionalStats ?? {},
            attribute: system?.data?.attribute ?? '',
            isCoreSkill: isCore,
            die: {
              sides: skillsDict[skillName].die.sides,
              modifier: skillsDict[skillName].die.modifier,
            },
          },
          effects: system?.effects?.toJSON() ?? [],
          flags: system?.flags ?? {},
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
      const { system } = await checkforItem(edgeName, 'edge');
      try {
        allEdges.push({
          type: 'edge',
          name: capitalizeEveryWord(edgeName),
          img: system?.img ?? 'systems/swade/assets/icons/edge.svg',
          data: {
            ...system?.data,
            description: system?.data?.description ?? '',
            notes: system?.data?.notes ?? '',
            additionalStats: system?.data?.additionalStats ?? {},
            isArcaneBackground:
              system?.data?.isArcaneBackground ??
              new RegExp(game.i18n.localize('npcImporter.parser.Arcane')).test(
                edgeName
              ),
            requirements: {
              value: system?.data?.requirements.value ?? '',
            },
          },
          effects: system?.effects?.toJSON() ?? [],
          flags: system?.flags ?? {},
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
      'npcImporter.parser.Major'
    )}(,)?\\s?|${game.i18n.localize('npcImporter.parser.Minor')}(,)?\\s?`,
    'ig'
  );
  if (hindrances != undefined) {
    var allHindrances = [];
    for (let i = 0; i < hindrances.length; i++) {
      let hindranceName = hindrances[i].trim();
      let isMajor = RegExp(
        `\\(${game.i18n.localize('npcImporter.parser.Major')}`,
        'ig'
      ).test(hindranceName);
      hindranceName = hindranceName
        .replace(majorMinor, '')
        .replace('()', '')
        .trim();
      const { system } = await checkforItem(hindranceName, 'hindrance');
      try {
        allHindrances.push({
          type: 'hindrance',
          name: capitalizeEveryWord(hindranceName),
          img: system?.img ?? 'systems/swade/assets/icons/hindrance.svg',
          data: {
            ...system?.data,
            description: system?.data?.description ?? '',
            notes: system?.data?.notes ?? '',
            additionalStats: system?.data?.additionalStats ?? {},
            major: isMajor,
          },
          effects: system?.effects?.toJSON() ?? [],
          flags: system?.flags ?? {},
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
      'npcImporter.parser.PowerPoints'
    )}|${game.i18n.localize('npcImporter.parser.Powers')}`
  ).test(abilityDescription);
  const { system } = await checkforItem(abilityName, 'ability');
  try {
    return {
      type: 'ability',
      name: capitalizeEveryWord(abilityName),
      img: system?.img ?? 'systems/swade/assets/icons/ability.svg',
      data: {
        ...system?.data,
        description: generateDescription(abilityDescription, system, true),
        notes: system?.data?.notes ?? '',
        additionalStats: system?.data?.additionalStats ?? {},
        subtype: 'special',
        grantsPowers: system?.data?.grantsPowers ?? doesGrantPowers,
      },
      effects: system?.effects?.toJSON() ?? [],
      flags: system?.flags ?? {},
    };
  } catch (error) {
    log(`Could not build ability: ${error}`);
  }
}

export async function itemBuilderFromSpecAbs(name, itemDescription, type) {
  let cleanName = checkSpecificItem(name).trim();
  let itemFromCompendium = await checkforItem(cleanName, type);
  const item = {
    type: type,
    name: itemFromCompendium?.data?.name ?? capitalizeEveryWord(name.trim()),
    img:
      itemFromCompendium?.data?.img ?? `systems/swade/assets/icons/${type}.svg`,
    data:
      itemFromCompendium?.data?.data !== undefined &&
      itemFromCompendium?.type === type
        ? itemFromCompendium?.data?.data
        : { description: itemDescription.trim() },
    effects: itemFromCompendium?.data?.effects?.toJSON() ?? [],
    flags: itemFromCompendium?.data?.flags ?? {},
  };
  if (itemFromCompendium?.type === type) {
    item.data.description = `${itemDescription.trim()}<hr>${
      itemFromCompendium?.data?.data?.description
    }`;
  }
  return item;
}

export async function powerBuilder(powers) {
  if (powers != undefined) {
    var allPowers = [];
    for (let i = 0; i < powers.length; i++) {
      const powerName = powers[i].trim();
      const { system } = await getItemFromCompendium(powerName, 'power');
      try {
        allPowers.push({
          type: 'power',
          name: capitalizeEveryWord(powerName),
          img: system?.img ?? 'systems/swade/assets/icons/power.svg',
          data: system?.data ?? {},
          effects: system?.effects?.toJSON() ?? [],
          flags: system?.flags ?? {},
        });
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
          'npcImporter.parser.Str'
        )}\\.|${game.i18n.localize('npcImporter.parser.Str')}`,
        'gi'
      ),
      '@str'
    )
    .replace(game.i18n.localize('npcImporter.parser.dice'), 'd');
  const { system } = await getItemFromCompendium(weaponName, 'weapon');
  //todo Improve this so that it'll add multiple entries for weapons which are ranged && melee
  const actions = system?.data?.actions ?? {
    skill: range
      ? game.i18n.localize('npcImporter.parser.Shooting')
      : game.i18n.localize('npcImporter.parser.Fighting'),
  };
  try {
    return {
      type: 'weapon',
      name: system?.name ?? capitalizeEveryWord(weaponName),
      img: system?.img ?? 'systems/swade/assets/icons/weapon.svg',
      data: {
        ...system?.data,
        description: generateDescription(weaponDescription, system),
        equippable: true,
        equipped: true,
        damage: dmg,
        range: range ?? system?.data?.range,
        rof: rof ?? system?.data?.rof,
        ap: ap ?? system?.data?.ap,
        shots: shots ?? system?.data?.shots,
        currentShots: shots ?? system?.data?.shots,
        actions: actions,
      },
      effects: system?.effects?.toJSON() ?? [],
      flags: system?.flags ?? {},
    };
  } catch (error) {
    log(`Could not build weapon: ${error}`);
  }
}

export async function shieldBuilder(
  shieldName,
  description,
  parry = 0,
  cover = 0
) {
  const { system } = await getItemFromCompendium(shieldName, 'shield');
  try {
    return {
      type: 'shield',
      name: system?.name ?? capitalizeEveryWord(shieldName),
      img: system?.img ?? 'systems/swade/assets/icons/shield.svg',
      data: {
        ...system?.data,
        description: generateDescription(description, system),
        notes: system?.data?.notes ?? '',
        additionalStats: system?.data?.additionalStats ?? {},
        equipped: true,
        equippable: true,
        parry: system?.data?.parry ?? parry,
        cover: system?.data?.cover ?? cover,
      },
      effects: system?.effects?.toJSON() ?? [],
      flags: system?.flags ?? {},
    };
  } catch (error) {
    log(`Could not build shield: ${error}`);
  }
}

export async function armorBuilder(armorName, armorBonus, armorDescription) {
  var cleanName = checkSpecificItem(armorName);
  const { system } = await getItemFromCompendium(cleanName, 'armor');
  try {
    return {
      type: 'armor',
      name: system?.name ?? capitalizeEveryWord(armorName),
      img: system?.img ?? 'systems/swade/assets/icons/armor.svg',
      data: {
        ...system?.data,
        description: generateDescription(armorDescription, system),
        notes: system?.data?.notes ?? '',
        additionalStats: system?.data?.additionalStats ?? {},
        equipped: true,
        equippable: true,
        armor: system?.data?.armor ?? armorBonus,
      },
      effects: system?.effects?.toJSON() ?? [],
      flags: system?.flags ?? {},
    };
  } catch (error) {
    log(`Could not build armor: ${error}`);
  }
}

export async function gearBuilder(gearName, description) {
  const { system } = await checkforItem(gearName, 'gear');
  try {
    return {
      type: 'gear',
      name: system?.name ?? capitalizeEveryWord(gearName),
      img: system?.img ?? 'systems/swade/assets/icons/gear.svg',
      data: {
        ...system?.data,
        description: generateDescription(description, system),
        equipped: false,
        equippable: false,
      },
      effects: system?.effects?.toJSON() ?? [],
      flags: system?.flags ?? {},
    };
  } catch (error) {
    log(`Could not build gear: ${error}`);
  }
}

export function additionalStatsBuilder(
  additionalStatName,
  additionalStatValue
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
      'npcImporter.parser.Size'
    )}|${game.i18n.localize('npcImporter.parser.Fear')}|${game.i18n.localize(
      'npcImporter.parser.Weakness'
    )}$`
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
  if (!isEmpty(itemFromCompendium.system)) return itemFromCompendium;

  itemFromCompendium = await getItemFromCompendium(
    itemName.split('(')[0].trim(),
    itemType
  );

  if (isEmpty(itemFromCompendium.system)) {
    itemFromCompendium = await getItemFromCompendium(
      itemName.split('(')[0].replace(new RegExp('[+-−]?\\d'), '').trim(),
      itemType
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
    return itemData?.data?.description
      ? `${desc ?? description}<hr>${itemData?.data?.description}`
      : description;
  } else return '';
}
