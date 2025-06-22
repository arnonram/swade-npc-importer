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
import { foundryI18nLocalize } from '../utils/foundryWrappers';

export const buildActorData = async function (
  parsedData: ParsedActor,
  isWildCard: boolean,
  actorType: string,
) {
  var system: any = {};

  (system.attributes = generateAttributes(parsedData)),
    (system.stats = {
      toughness: {
        value: parsedData.toughness,
        modifier: toughnessBonus(parsedData),
        armor: 0, //TODO
      },
      parry: {
        value: parsedData.parry,
        shield: 0, //TODO
        modifier: 0, //TODO
      },
      size: parsedData.size,
      speed: {
        runningDie: findRunningDie(parsedData),
        runningMod: findRunningMod(parsedData),
        value: parsedData.pace,
      },
    });
  system.details = {
    biography: { value: parsedData.biography },
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
  system.pace = {
    //TODO: find all the other pace methods
    base: 'ground',
    ground: parsedData.pace,
    fly: null,
    swim: null,
    burrow: null,
    running: {
      die: findRunningDie(parsedData),
      mod: findRunningMod(parsedData),
    },
  };
  return system;
};

function generateAttributes(parsedData: ParsedActor) {
  let attributesData = parsedData.attributes;

  let unShakeBonus = findUnshakeBonus(parsedData);
  if (unShakeBonus != undefined) {
    attributesData.spirit.unShakeBonus = unShakeBonus;
  }

  // delete attributesData.animalSmarts; TODO: why?
  return attributesData;
}

async function buildAdditionalStats(parsedData: ParsedActor) {
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

function calculateBennies(isWildCard: boolean, actorType: string) {
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

function calculateWoundMod(
  size: number = 0,
  isWildCard: boolean,
  specialAbs: any,
) {
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

function initiativeMod(parsedData: ParsedActor) {
  let hasHesitant = false;
  let hasLevelHeaded = false;
  let hasImpLevelHeaded = false;
  let hasQuick = false;

  if (parsedData.edges != undefined) {
    parsedData.edges.forEach((element: string | undefined) => {
      if (
        element === foundryI18nLocalize('npcImporter.parser.LevelHeadedImp')
      ) {
        hasImpLevelHeaded = true;
      } else if (
        element === foundryI18nLocalize('npcImporter.parser.LevelHeaded')
      ) {
        hasLevelHeaded = true;
      }
      if (element === foundryI18nLocalize('npcImporter.parser.Quick')) {
        hasQuick = true;
      }
    });
  }
  if (parsedData.hindrances != undefined) {
    parsedData.hindrances.forEach((element: string | undefined) => {
      if (element === foundryI18nLocalize('npcImporter.parser.Hesitant')) {
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

function findRunningDie(parsedData: ParsedActor) {
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
                foundryI18nLocalize('npcImporter.regex.dice') as string,
                'i',
              ),
            )[0]
            .replace(/[a-zA-Z]/i, ''),
        );
      }
    }
    for (const edge in parsedData.edges) {
      if (
        edge
          .toLowerCase()
          .includes(
            game.i18n
              ?.localize('npcImporter.parser.FleetFooted')
              .toLowerCase() as string,
          )
      ) {
        runningDie += 2;
      }
    }
  } catch (error) {}

  return runningDie;
}

function findRunningMod(parsedData: ParsedActor) {
  try {
    let runningMode = 0;
    parsedData.edges?.forEach((edge: string) => {
      if (
        edge
          .toLowerCase()
          .includes(
            game.i18n
              ?.localize('npcImporter.parser.FleetFooted')
              .toLowerCase() || '',
          )
      ) {
        runningMode += 2;
      }
    });
    return runningMode;
  } catch (error) {}
}

function calculateIgnoredWounds(parsedData: ParsedActor) {
  let bonusTotal = 0;
  if (getModuleSettings(settingCalculateIgnoredWounds)) {
    const ignoreWound = [
      foundryI18nLocalize('npcImporter.parser.Undead'),
      foundryI18nLocalize('npcImporter.parser.Construct'),
      foundryI18nLocalize('npcImporter.parser.Elemental'),
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

function findUnshakeBonus(parsedData: ParsedActor) {
  const unshakeBonus = [
    foundryI18nLocalize('npcImporter.parser.Undead'),
    foundryI18nLocalize('npcImporter.parser.Construct'),
    foundryI18nLocalize('npcImporter.parser.CombatReflexes'),
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

function toughnessBonus(parsedData: ParsedActor) {
  const toughnessBonus = [
    foundryI18nLocalize('npcImporter.parser.Undead'),
    foundryI18nLocalize('npcImporter.parser.Brawny'),
    foundryI18nLocalize('npcImporter.parser.Brawler'),
    foundryI18nLocalize('npcImporter.parser.Bruiser'),
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
    parsedData.ddges.forEach((edge: string) => {
      if (toughnessBonus.includes(edge.toLowerCase())) {
        bonusTotal += 1;
      }
    });
  }

  return bonusTotal;
}
