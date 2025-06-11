import {
  getActorAddtionalStatsArray,
  getModuleSettings,
} from '../utils/foundryActions';
import { additionalStatsBuilder } from './itemBuilder.js';
import { ParsedActor } from '../types/importedActor';
import {
  settingAutoCalcToughness,
  settingCalculateAdditionalWounds,
  settingCalculateIgnoredWounds,
  settingNumberOfBennies,
} from '../global';

export const buildActorData = async function (
  parsedData: ParsedActor,
  isWildCard: boolean,
  actorType: string,
) {
  var system: any = {};

  (system.attributes = generateAttributes(parsedData)),
    (system.stats = {
      speed: {
        runningDie: findRunningDie(parsedData),
        runningMod: findRunningMod(parsedData),
        value: parsedData.pace,
      },
      toughness: {
        value: parsedData.toughness,
        modifier: toughnessBonus(parsedData),
      },
      parry: { value: parsedData.parry },
      size: parsedData.size,
    });
  system.details = {
    biography: parsedData.biography,
    autoCalcToughness: getModuleSettings(settingAutoCalcToughness),
  };
  system.powerPoints = {
    general: {
      value: parsedData.powerpoints,
      max: parsedData.powerpoints,
    },
  };
  system.wounds = {
    max: calculateWoundMod(
      parsedData.size,
      isWildCard,
      parsedData.specialabilities,
    ),
    ignored: calculateIgnoredWounds(parsedData),
  };
  system.initiative = initiativeMod(parsedData);
  system.wildcard = isWildCard;
  system.additionalStats = await buildAdditionalStats(parsedData);
  system.bennies = calculateBennies(isWildCard, actorType);
  return system;
};

function generateAttributes(parsedData) {
  let attributesData = parsedData.attributes;

  let unShakeBonus = findUnshakeBonus(parsedData);
  if (unShakeBonus != undefined) {
    attributesData.spirit.unShakeBonus = unShakeBonus;
  }

  delete attributesData.animalSmarts;
  return attributesData;
}

async function buildAdditionalStats(parsedData) {
  let additionalStats = {};
  let actorSystemStats = getActorAddtionalStatsArray();
  actorSystemStats.forEach(element => {
    let statName = element.replace(':', '');
    let statValue = parsedData[statName];
    if (statValue !== undefined) {
      additionalStats[statName] = additionalStatsBuilder(statName, statValue);
    }
  });
  return additionalStats;
}

function calculateBennies(isWildCard, actorType) {
  let numOfBennies = 0;
  if (isWildCard && actorType === 'npc') {
    numOfBennies = getModuleSettings(settingNumberOfBennies);
  } else if (isWildCard && actorType === 'character') {
    numOfBennies = 3;
  }

  return {
    value: numOfBennies,
    max: numOfBennies,
  };
}

function calculateWoundMod(size, isWildCard, specialAbs) {
  var baseWounds = isWildCard ? 3 : 0;
  if (getModuleSettings(settingCalculateAdditionalWounds)) {
    if (size >= 4 && size <= 7) {
      baseWounds += 1;
    }
    if (size >= 8 && size <= 11) {
      baseWounds += 2;
    }
    if (size >= 12) {
      baseWounds += 3;
    }

    for (const ability in specialAbs) {
      if (
        `${game.i18n
          ?.localize('npcImporter.parser.Resilient')
          .toLowerCase()}`.includes(
          ability.replace(new RegExp('^@([aehw]|sa)'), '').toLowerCase().trim(),
        )
      ) {
        baseWounds += 1;
      } else if (
        `${game.i18n
          ?.localize('npcImporter.parser.VeryResilient')
          .toLowerCase()}`.includes(
          ability.replace(new RegExp('^@([aehw]|sa)'), '').toLowerCase().trim(),
        )
      ) {
        baseWounds += 2;
      }
    }
    return baseWounds;
  }
  return baseWounds;
}

function initiativeMod(parsedData) {
  let hasHesitant = false;
  let hasLevelHeaded = false;
  let hasImpLevelHeaded = false;
  let hasQuick = false;

  if (parsedData.edges != undefined) {
    parsedData.edges.forEach(element => {
      if (
        element === game.i18n?.localize('npcImporter.parser.LevelHeadedImp')
      ) {
        hasImpLevelHeaded = true;
      } else if (
        element === game.i18n?.localize('npcImporter.parser.LevelHeaded')
      ) {
        hasLevelHeaded = true;
      }
      if (element === game.i18n?.localize('npcImporter.parser.Quick')) {
        hasQuick = true;
      }
    });
  }
  if (parsedData.hindrances != undefined) {
    parsedData.hindrances.forEach(element => {
      if (element === game.i18n?.localize('npcImporter.parser.Hesitant')) {
        hasHesitant = true;
      }
    });
  }
  return {
    hasHesitant: hasHesitant,
    hasLevelHeaded: hasLevelHeaded,
    hasImpLevelHeaded: hasImpLevelHeaded,
    hasQuick: hasQuick,
  };
}

function findRunningDie(parsedData) {
  let runningDie = 6;

  try {
    for (const ability in parsedData.specialabilities) {
      if (
        ability
          .toLowerCase()
          .includes(
            game.i18n
              ?.localize('npcImporter.parser.Speed')
              .toLowerCase() as string,
          )
      ) {
        return parseInt(
          parsedData.specialabilities[ability]
            .match(
              new RegExp(
                game.i18n?.localize('npcImporter.regex.dice') as string,
                'i',
              ),
            )[0]
            .replace(/[a-zA-Z]/i, ''),
        );
      }
    }
    parsedData.edges.forEach(edge => {
      if (
        edge
          .toLowerCase()
          .includes(
            game.i18n?.localize('npcImporter.parser.FleetFooted').toLowerCase(),
          )
      ) {
        runningDie += 2;
      }
    });
  } catch (error) {}

  return runningDie;
}

function findRunningMod(parsedData) {
  try {
    let runningMode = 0;
    parsedData.edges.forEach(edge => {
      if (
        edge
          .toLowerCase()
          .includes(
            game.i18n?.localize('npcImporter.parser.FleetFooted').toLowerCase(),
          )
      ) {
        runningMode += 2;
      }
    });
    return runningMode;
  } catch (error) {}
}

function calculateIgnoredWounds(parsedData) {
  let bonusTotal = 0;
  if (getModuleSettings(settingCalculateIgnoredWounds)) {
    const ignoreWound = [
      game.i18n?.localize('npcImporter.parser.Undead'),
      game.i18n?.localize('npcImporter.parser.Construct'),
      game.i18n?.localize('npcImporter.parser.Elemental'),
    ];

    for (const ability in parsedData.specialabilities) {
      if (
        ignoreWound.includes(
          ability.replace(new RegExp('^@([aehw]|sa)'), '').toLowerCase().trim(),
        )
      ) {
        bonusTotal += 1;
      }
    }
  }
  return bonusTotal;
}

function findUnshakeBonus(parsedData) {
  const unshakeBonus = [
    game.i18n?.localize('npcImporter.parser.Undead'),
    game.i18n?.localize('npcImporter.parser.Construct'),
    game.i18n?.localize('npcImporter.parser.CombatReflexes'),
  ];

  let bonusTotal = 0;
  for (const ability in parsedData.specialabilities) {
    if (
      unshakeBonus.includes(
        ability.replace(new RegExp('^@([aehw]|sa)'), '').toLowerCase().trim(),
      )
    ) {
      bonusTotal += 2;
    }
  }

  if (parsedData.edges != undefined) {
    parsedData.edges.forEach(edge => {
      if (unshakeBonus.includes(edge.toLowerCase())) {
        bonusTotal += 2;
      }
    });
  }

  return bonusTotal;
}

function toughnessBonus(parsedData) {
  const toughnessBonus = [
    game.i18n?.localize('npcImporter.parser.Undead'),
    game.i18n?.localize('npcImporter.parser.Brawny'),
    game.i18n?.localize('npcImporter.parser.Brawler'),
    game.i18n?.localize('npcImporter.parser.Bruiser'),
  ];
  let bonusTotal = 0;
  for (const ability in parsedData.specialabilities) {
    if (
      toughnessBonus.includes(
        ability.replace(new RegExp('^@([aehw]|sa)'), '').toLowerCase().trim(),
      )
    ) {
      bonusTotal += 2;
    }
  }

  if (parsedData.ddges != undefined) {
    parsedData.ddges.forEach(edge => {
      if (toughnessBonus.includes(edge.toLowerCase())) {
        bonusTotal += 1;
      }
    });
  }

  return bonusTotal;
}
