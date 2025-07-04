import { getModuleSettings } from '../utils/foundryActions';
import { ParsedActor } from '../types/importedActor';
import { settingAutoCalcToughness } from '../global';
import {
  generateAttributes,
  toughnessBonus,
  findRunningDie,
  findRunningMod,
  calculateWoundMod,
  calculateIgnoredWounds,
  initiativeMod,
  buildAdditionalStats,
  calculateBennies,
} from './buildActorDataHelpers';

export const buildActorData = async function (
  parsedData: ParsedActor,
  isWildCard: boolean,
  actorType: string,
) {
  const system: any = {};

  system.attributes = generateAttributes(parsedData);
  system.stats = {
    toughness: {
      value: parsedData.toughness?.value,
      modifier: toughnessBonus(parsedData),
      armor: parsedData.toughness?.armor,
    },
    parry: {
      value: parsedData.parry,
      shield: 0, // TODO
      modifier: 0, // TODO
    },
    size: parsedData.size,
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
      parsedData.specialAbilities,
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
