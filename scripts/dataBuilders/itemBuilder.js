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

export const skillBuilder = async function (skillsDict) {
  const coreSkills = getSystemCoreSkills();
  if (skillsDict != undefined) {
    var allSkills = [];
    for (const skillName in skillsDict) {
      const { data } = await checkforItem(skillName, 'skill');
      const isCore = coreSkills.includes(skillName);
      try {
        allSkills.push({
          type: 'skill',
          name: capitalizeEveryWord(skillName),
          img: data?.img ?? 'systems/swade/assets/icons/skill.svg',
          data: {
            ...data?.data,
            description: data?.data?.description ?? '',
            notes: data?.data?.notes ?? '',
            additionalStats: data?.data?.additionalStats ?? {},
            attribute: data?.data?.attribute ?? '',
            isCoreSkill: isCore,
            die: {
              sides: skillsDict[skillName].die.sides,
              modifier: skillsDict[skillName].die.modifier,
            },
          },
        });
      } catch (error) {
        log(`Could not build skill: ${error}`);
      }
    }
    return allSkills;
  }
};

export const edgeBuilder = async function (edges) {
  if (edges != undefined) {
    var allEdges = [];
    for (let i = 0; i < edges.length; i++) {
      let edgeName = edges[i].trim();
      const { data } = await checkforItem(edgeName, 'edge');
      try {
        allEdges.push({
          type: 'edge',
          name: capitalizeEveryWord(edgeName),
          img: data?.img ?? 'systems/swade/assets/icons/edge.svg',
          data: {
            ...data?.data,
            description: data?.data?.description ?? '',
            notes: data?.data?.notes ?? '',
            additionalStats: data?.data?.additionalStats ?? {},
            isArcaneBackground:
              data?.data?.isArcaneBackground ??
              new RegExp(game.i18n.localize('npcImporter.parser.Arcane')).test(
                edgeName
              ),
            requirements: {
              value: data?.data?.requirements.value ?? '',
            },
          },
        });
      } catch (error) {
        log(`Could not build edge: ${error}`);
      }
    }
    return allEdges;
  }
};

export const hindranceBuilder = async function (hindrances) {
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
      const { data } = await checkforItem(hindranceName, 'hindrance');
      try {
        allHindrances.push({
          type: 'hindrance',
          name: capitalizeEveryWord(hindranceName),
          img: data?.img ?? 'systems/swade/assets/icons/hindrance.svg',
          data: {
            ...data?.data,
            description: data?.data?.description ?? '',
            notes: data?.data?.notes ?? '',
            additionalStats: data?.data?.additionalStats ?? {},
            major: isMajor,
          },
        });
      } catch (error) {
        log(`Could not build hindrance: ${error}`);
      }
    }

    return allHindrances;
  }
};

export const AbilityBuilder = async function (abilityName, abilityDescription) {
  const doesGrantPowers = new RegExp(
    `${game.i18n.localize(
      'npcImporter.parser.PowerPoints'
    )}|${game.i18n.localize('npcImporter.parser.Powers')}`
  ).test(abilityDescription);
  const { data } = await checkforItem(abilityName, 'ability');
  try {
    return {
      type: 'ability',
      name: capitalizeEveryWord(abilityName),
      img: data?.img ?? 'systems/swade/assets/icons/ability.svg',
      data: {
        ...data?.data,
        description: generateDescription(abilityDescription, data, true),
        notes: data?.data?.notes ?? '',
        additionalStats: data?.data?.additionalStats ?? {},
        subtype: 'special',
        grantsPowers: data?.data?.grantsPowers ?? doesGrantPowers,
      },
    };
  } catch (error) {
    log(`Could not build ability: ${error}`);
  }
};

export const ItemBuilderFromSpecAbs = async function (
  name,
  itemDescription,
  type
) {
  let cleanName = checkSpecificItem(name).trim();
  let itemFromCompendium = await checkforItem(cleanName, type);
  const item = {
    type: type,
    name: itemFromCompendium?.data?.name ?? capitalizeEveryWord(name.trim()),
    img:
      itemFromCompendium?.data?.img ?? `systems/swade/assets/icons/${type}.svg`,
    data:
      itemFromCompendium?.data?.data && itemFromCompendium?.type === type
        ? itemFromCompendium?.data?.data
        : { description: itemDescription.trim() },
  };
  if (itemFromCompendium?.type === type) {
    item.data.description = `${itemDescription.trim()}<hr>${
      itemFromCompendium?.data?.data?.description
    }`;
  }
  return item;
};

export const powerBuilder = async function (powers) {
  if (powers != undefined) {
    var allPowers = [];
    for (let i = 0; i < powers.length; i++) {
      const powerName = powers[i].trim();
      const { data } = await getItemFromCompendium(powerName, 'power');
      try {
        allPowers.push({
          type: 'power',
          name: capitalizeEveryWord(powerName),
          img: data?.img ?? 'systems/swade/assets/icons/power.svg',
          data: data?.data ?? {},
        });
      } catch (error) {
        log(`Could not build power: ${error}`);
      }
    }
    return allPowers;
  }
};

export const WeaponBuilder = async function ({
  weaponName,
  weaponDescription,
  weaponDamage,
  range,
  rof,
  ap,
  shots,
}) {
  const dmg = weaponDamage?.replace(
    new RegExp(
      `${game.i18n.localize('npcImporter.parser.Str')}\\.|${game.i18n.localize(
        'npcImporter.parser.Str'
      )}`,
      'gi'
    ),
    '@str'
  );
  const { data } = await getItemFromCompendium(weaponName, 'weapon');
  //todo Improve this so that it'll add multiple entries for weapons which are ranged && melee
  const actions = data?.data?.actions ?? {
    skill: range
      ? game.i18n.localize('npcImporter.parser.Shooting')
      : game.i18n.localize('npcImporter.parser.Fighting'),
  };
  try {
    return {
      type: 'weapon',
      name: data?.name ?? capitalizeEveryWord(weaponName),
      img: data?.img ?? 'systems/swade/assets/icons/weapon.svg',
      data: {
        ...data?.data,
        description: generateDescription(weaponDescription, data),
        equippable: true,
        equipped: true,
        damage: dmg,
        range: range ?? data?.data?.range,
        rof: rof ?? data?.data?.rof,
        ap: ap ?? data?.data?.ap,
        shots: shots ?? data?.data?.shots,
        currentShots: shots ?? data?.data?.shots,
        actions: actions,
      },
    };
  } catch (error) {
    log(`Could not build weapon: ${error}`);
  }
};

export const ShieldBuilder = async function (
  shieldName,
  description,
  parry = 0,
  cover = 0
) {
  const { data } = await getItemFromCompendium(shieldName, 'shield');
  try {
    return {
      type: 'shield',
      name: data?.name ?? capitalizeEveryWord(shieldName),
      img: data?.img ?? 'systems/swade/assets/icons/shield.svg',
      data: {
        ...data?.data,
        description: generateDescription(description, data),
        notes: data?.data?.notes ?? '',
        additionalStats: data?.data?.additionalStats ?? {},
        equipped: true,
        equippable: true,
        parry: data?.data?.parry ?? parry,
        cover: data?.data?.cover ?? cover,
      },
    };
  } catch (error) {
    log(`Could not build shield: ${error}`);
  }
};

export const ArmorBuilder = async function (
  armorName,
  armorBonus,
  armorDescription
) {
  var cleanName = checkSpecificItem(armorName);
  const { data } = await getItemFromCompendium(cleanName, 'armor');
  try {
    return {
      type: 'armor',
      name: data?.name ?? capitalizeEveryWord(armorName),
      img: data?.img ?? 'systems/swade/assets/icons/armor.svg',
      data: {
        ...data?.data,
        description: generateDescription(armorDescription, data),
        notes: data?.data?.notes ?? '',
        additionalStats: data?.data?.additionalStats ?? {},
        equipped: true,
        equippable: true,
        armor: data?.data?.armor ?? armorBonus,
      },
    };
  } catch (error) {
    log(`Could not build armor: ${error}`);
  }
};

export const GearBuilder = async function (gearName, description) {
  const { data } = await checkforItem(gearName, 'gear');
  try {
    return {
      type: 'gear',
      name: data?.name ?? capitalizeEveryWord(gearName),
      img: data?.img ?? 'systems/swade/assets/icons/gear.svg',
      data: {
        ...data?.data,
        description: generateDescription(description, data),
        equipped: false,
        equippable: false,
      },
    };
  } catch (error) {
    log(`Could not build gear: ${error}`);
  }
};

export const additionalStatsBuilder = function (
  additionalStatName,
  additionalStatValue
) {
  let gameAditionalStat = getSpecificAdditionalStat(additionalStatName);
  if (gameAditionalStat !== undefined) {
    gameAditionalStat['value'] = additionalStatValue;
    return gameAditionalStat;
  }
};

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
  if (!isObjectEmpty(itemFromCompendium.data)) return itemFromCompendium;

  itemFromCompendium = await getItemFromCompendium(
    itemName.split('(')[0].trim(),
    itemType
  );

  if (isObjectEmpty(itemFromCompendium.data)) {
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
  if (description && isSpecialAbility && itemData.name) {
    desc = `${description.trim()}<br>${spcialAbilitiesLink(itemData.name)}`;
  }
  if (description) {
    return itemData?.data?.description
      ? `${desc ?? description}<hr>${itemData?.data?.description}`
      : description;
  } else return '';
}
