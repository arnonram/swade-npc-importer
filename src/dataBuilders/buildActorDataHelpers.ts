import {
  getActorAddtionalStats,
  getModuleSettings,
} from '../utils/foundryActions';
import { ParsedActor } from '../types/importedActor';
import {
  settingCalculateAdditionalWounds,
  settingCalculateIgnoredWounds,
  settingNumberOfBennies,
} from '../global';
import { foundryI18nLocalize } from '../utils/foundryWrappers';
import { cleanKeyName } from '../../src/utils/textUtils';

export function generateAttributes(parsedData: ParsedActor) {
  const attributes = { ...parsedData.attributes };
  const bonus = findUnshakeBonus(parsedData);
  if (bonus !== undefined) {
    attributes.spirit.unShakeBonus = bonus;
  }
  return attributes;
}

export async function buildAdditionalStats(parsedData: ParsedActor) {
  const additionalStats = getActorAddtionalStats();
  if (!additionalStats) return {};

  for (const key in additionalStats) {
    const stat = additionalStats[key];
    if (!parsedData[stat.label]) continue;
    if (stat.dtype === 'Die') {
      additionalStats[key].modifier = parsedData[stat.label].modifier;
      additionalStats[key].value = `d${parsedData[stat.label].sides}`;
    } else if (stat.dtype === 'Number') {
      const value = parsedData[stat.label];
      additionalStats[key].max = stat.hasMaxValue ? value : undefined;
      additionalStats[key].value = value;
    } else if (stat.dtype === 'String') {
      const value = parsedData[stat.label];
      additionalStats[key].value = value ?? '';
    }
  }

  return additionalStats;
}

export function calculateBennies(isWildCard: boolean, actorType: string) {
  if (isWildCard && actorType === 'npc') {
    const value = getModuleSettings(settingNumberOfBennies);
    return { value, max: value };
  } else if (isWildCard && actorType === 'character') {
    return { value: 3, max: 3 };
  }
  return { value: 0, max: 0 };
}

export function calculateWoundMod(
  size: number = 0,
  isWildCard: boolean,
  specialAbs?: Record<string, string>,
) {
  let baseWounds = isWildCard ? 3 : 0;

  if (getModuleSettings(settingCalculateAdditionalWounds)) {
    if (size >= 4 && size <= 7) baseWounds += 1;
    else if (size >= 8 && size <= 11) baseWounds += 2;
    else if (size >= 12) baseWounds += 3;

    for (const key in specialAbs) {
      const name = cleanKeyName(key);
      if (
        name ===
        foundryI18nLocalize('npcImporter.parser.VeryResilient').toLowerCase()
      ) {
        baseWounds += 2;
      } else if (
        name ===
        foundryI18nLocalize('npcImporter.parser.Resilient').toLowerCase()
      ) {
        baseWounds += 1;
      }
    }
  }

  return baseWounds;
}

export function calculateIgnoredWounds(parsedData: ParsedActor) {
  if (!getModuleSettings(settingCalculateIgnoredWounds)) return 0;

  const relevant = [
    foundryI18nLocalize('npcImporter.parser.Undead'),
    foundryI18nLocalize('npcImporter.parser.Construct'),
    foundryI18nLocalize('npcImporter.parser.Elemental'),
  ];

  let total = 0;
  for (const key in parsedData.specialAbilities) {
    const cleaned = cleanKeyName(key);
    if (relevant.includes(cleaned)) total += 1;
  }
  return total;
}

export function findUnshakeBonus(parsedData: ParsedActor) {
  const specialAbilitiesConferringUnshakeBonus = [
    foundryI18nLocalize('npcImporter.parser.Undead'),
    foundryI18nLocalize('npcImporter.parser.Construct'),
  ];

  const edgesConferringUnshakeBonus = [
    foundryI18nLocalize('npcImporter.parser.CombatReflexes'),
  ];

  let total = 0;
  for (const key in parsedData.specialAbilities) {
    if (specialAbilitiesConferringUnshakeBonus.includes(cleanKeyName(key)))
      total += 2;
  }

  parsedData.edges?.forEach(edge => {
    if (
      edgesConferringUnshakeBonus
        .map(e => e.toLowerCase())
        .includes(edge.toLowerCase())
    )
      total += 2;
  });

  return total;
}

export function toughnessBonus(parsedData: ParsedActor) {
  const edgesConferringToughness = [
    foundryI18nLocalize('npcImporter.parser.Brawny'),
    foundryI18nLocalize('npcImporter.parser.Brawler'),
    foundryI18nLocalize('npcImporter.parser.Bruiser'),
  ];

  const specialAbilitiesConferringToughness = [
    foundryI18nLocalize('npcImporter.parser.Undead'),
  ];

  let total = 0;
  for (const key in parsedData.specialAbilities) {
    if (specialAbilitiesConferringToughness.includes(cleanKeyName(key)))
      total += 2;
  }

  parsedData.edges?.forEach(edge => {
    if (
      edgesConferringToughness
        .map(e => e.toLowerCase())
        .includes(edge.toLowerCase())
    )
      total += 1;
  });

  return total;
}

export function initiativeMod(parsedData: ParsedActor) {
  const out = {
    hasHesitant: false,
    hasLevelHeaded: false,
    hasImpLevelHeaded: false,
    hasQuick: false,
  };

  parsedData.edges?.forEach(edge => {
    if (edge === foundryI18nLocalize('npcImporter.parser.LevelHeadedImp'))
      out.hasImpLevelHeaded = true;
    else if (edge === foundryI18nLocalize('npcImporter.parser.LevelHeaded'))
      out.hasLevelHeaded = true;
    if (edge === foundryI18nLocalize('npcImporter.parser.Quick'))
      out.hasQuick = true;
  });

  parsedData.hindrances?.forEach(hindrance => {
    if (hindrance === foundryI18nLocalize('npcImporter.parser.Hesitant'))
      out.hasHesitant = true;
  });

  return out;
}

export function findRunningDie(parsedData: ParsedActor) {
  let die = 6;
  if (!parsedData.specialAbilities) return die;

  for (const key in parsedData.specialAbilities) {
    if (
      cleanKeyName(key) ===
      foundryI18nLocalize('npcImporter.parser.Speed').toLowerCase()
    ) {
      const match = parsedData.specialAbilities[key].match(
        new RegExp(foundryI18nLocalize('npcImporter.regex.dice'), 'i'),
      );
      if (match?.[0]) {
        return parseInt(match[0].replace(/[a-z]/i, ''));
      }
    }

    if (
      parsedData.specialAbilities[key].includes(
        foundryI18nLocalize('npcImporter.parser.RunningDie').toLowerCase(),
      )
    ) {
      const match = parsedData.specialAbilities[key].match(
        new RegExp(foundryI18nLocalize('npcImporter.regex.dice'), 'i'),
      );
      if (match?.[0]) {
        die = parseInt(match[0].replace(/[a-z]/i, ''));
      }
    }
  }

  parsedData.edges?.forEach(edge => {
    if (
      edge
        .toLowerCase()
        .includes(
          foundryI18nLocalize('npcImporter.parser.FleetFooted').toLowerCase(),
        )
    ) {
      die += 2;
    }
  });

  return die;
}

export function findRunningMod(parsedData: ParsedActor) {
  let mod = 0;

  try {
    parsedData.edges?.forEach(edge => {
      if (
        edge
          .toLowerCase()
          .includes(
            foundryI18nLocalize('npcImporter.parser.FleetFooted').toLowerCase(),
          )
      ) {
        mod += 2;
      }
    });
  } catch {}

  return mod;
}

export function checkBruteEdge(actorItems: any[]) {
  const bruteName = foundryI18nLocalize('npcImporter.parser.Brute');
  const athleticsName = foundryI18nLocalize('npcImporter.parser.Athletics');
  const hasBrute = actorItems.some(item => item.name === bruteName);
  const athletics = actorItems.find(item => item.name === athleticsName);
  if (hasBrute && athletics) {
    athletics.system.attribute = 'strength';
  }
  return actorItems;
}
