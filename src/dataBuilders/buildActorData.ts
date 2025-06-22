import {
  getActorAddtionalStatsArray,
  getModuleSettings,
} from '../utils/foundryActions';
import { additionalStatsBuilder } from './itemBuilders';
import { ParsedActor } from '../types/importedActor';
import {
  settingAutoCalcToughness,
  settingCalculateAdditionalWounds,
  settingCalculateIgnoredWounds,
  settingNumberOfBennies,
} from '../global';
import { foundryI18nLocalize } from '../utils/foundryWrappers';

const cleanKeyName = (key: string) =>
  key
    .replace(/^@([aehw]|sa)/, '')
    .toLowerCase()
    .trim();

const i18n = (key: string) => foundryI18nLocalize(key);

export const buildActorData = async function (
  parsedData: ParsedActor,
  isWildCard: boolean,
  actorType: string,
) {
  const system: any = {};

  system.attributes = generateAttributes(parsedData);
  system.stats = {
    toughness: {
      value: parsedData.toughness,
      modifier: toughnessBonus(parsedData),
      armor: 0, // TODO
    },
    parry: {
      value: parsedData.parry,
      shield: 0, // TODO
      modifier: 0, // TODO
    },
    size: parsedData.size,
    speed: {
      runningDie: findRunningDie(parsedData),
      runningMod: findRunningMod(parsedData),
      value: parsedData.pace,
    },
  };

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
  const attributes = { ...parsedData.attributes };
  const bonus = findUnshakeBonus(parsedData);
  if (bonus !== undefined) {
    attributes.spirit.unShakeBonus = bonus;
  }
  return attributes;
}

async function buildAdditionalStats(parsedData: ParsedActor) {
  const stats: Record<string, any> = {};
  const systemStats = getActorAddtionalStatsArray();
  systemStats.forEach(stat => {
    const key = stat.replace(':', '');
    const value = parsedData[key];
    if (value !== undefined) {
      stats[key] = additionalStatsBuilder(key, value);
    }
  });
  return stats;
}

function calculateBennies(isWildCard: boolean, actorType: string) {
  if (isWildCard && actorType === 'npc') {
    const value = getModuleSettings(settingNumberOfBennies);
    return { value, max: value };
  } else if (isWildCard && actorType === 'character') {
    return { value: 3, max: 3 };
  }
  return { value: 0, max: 0 };
}

function calculateWoundMod(
  size: number = 0,
  isWildCard: boolean,
  specialAbs: Record<string, any>,
) {
  let baseWounds = isWildCard ? 3 : 0;

  if (getModuleSettings(settingCalculateAdditionalWounds)) {
    if (size >= 4 && size <= 7) baseWounds += 1;
    else if (size >= 8 && size <= 11) baseWounds += 2;
    else if (size >= 12) baseWounds += 3;

    for (const key in specialAbs) {
      const name = cleanKeyName(key);
      if (name === i18n('npcImporter.parser.Resilient').toLowerCase()) {
        baseWounds += 1;
      } else if (
        name === i18n('npcImporter.parser.VeryResilient').toLowerCase()
      ) {
        baseWounds += 2;
      }
    }
  }

  return baseWounds;
}

function calculateIgnoredWounds(parsedData: ParsedActor) {
  if (!getModuleSettings(settingCalculateIgnoredWounds)) return 0;

  const relevant = [
    i18n('npcImporter.parser.Undead'),
    i18n('npcImporter.parser.Construct'),
    i18n('npcImporter.parser.Elemental'),
  ];

  let total = 0;
  for (const key in parsedData.specialabilities) {
    const cleaned = cleanKeyName(key);
    if (relevant.includes(cleaned)) total += 1;
  }
  return total;
}

function findUnshakeBonus(parsedData: ParsedActor) {
  const bonuses = [
    i18n('npcImporter.parser.Undead'),
    i18n('npcImporter.parser.Construct'),
    i18n('npcImporter.parser.CombatReflexes'),
  ];

  let total = 0;
  for (const key in parsedData.specialabilities) {
    if (bonuses.includes(cleanKeyName(key))) total += 2;
  }

  parsedData.edges?.forEach(edge => {
    if (bonuses.includes(edge.toLowerCase())) total += 2;
  });

  return total;
}

function toughnessBonus(parsedData: ParsedActor) {
  const bonuses = [
    i18n('npcImporter.parser.Undead'),
    i18n('npcImporter.parser.Brawny'),
    i18n('npcImporter.parser.Brawler'),
    i18n('npcImporter.parser.Bruiser'),
  ];

  let total = 0;
  for (const key in parsedData.specialabilities) {
    if (bonuses.includes(cleanKeyName(key))) total += 2;
  }

  parsedData.edges?.forEach(edge => {
    if (bonuses.includes(edge.toLowerCase())) total += 1;
  });

  return total;
}

function initiativeMod(parsedData: ParsedActor) {
  const out = {
    hasHesitant: false,
    hasLevelHeaded: false,
    hasImpLevelHeaded: false,
    hasQuick: false,
  };

  parsedData.edges?.forEach(edge => {
    if (edge === i18n('npcImporter.parser.LevelHeadedImp'))
      out.hasImpLevelHeaded = true;
    else if (edge === i18n('npcImporter.parser.LevelHeaded'))
      out.hasLevelHeaded = true;
    if (edge === i18n('npcImporter.parser.Quick')) out.hasQuick = true;
  });

  parsedData.hindrances?.forEach(hindrance => {
    if (hindrance === i18n('npcImporter.parser.Hesitant'))
      out.hasHesitant = true;
  });

  return out;
}

function findRunningDie(parsedData: ParsedActor) {
  let die = 6;

  try {
    for (const key in parsedData.specialabilities) {
      if (
        cleanKeyName(key) === i18n('npcImporter.parser.Speed').toLowerCase()
      ) {
        const match = parsedData.specialabilities[key].match(
          new RegExp(i18n('npcImporter.regex.dice'), 'i'),
        );
        if (match?.[0]) {
          return parseInt(match[0].replace(/[a-z]/i, ''));
        }
      }
    }

    parsedData.edges?.forEach(edge => {
      if (
        edge
          .toLowerCase()
          .includes(i18n('npcImporter.parser.FleetFooted').toLowerCase())
      ) {
        die += 2;
      }
    });
  } catch {}

  return die;
}

function findRunningMod(parsedData: ParsedActor) {
  let mod = 0;

  try {
    parsedData.edges?.forEach(edge => {
      if (
        edge
          .toLowerCase()
          .includes(i18n('npcImporter.parser.FleetFooted').toLowerCase())
      ) {
        mod += 2;
      }
    });
  } catch {}

  return mod;
}
