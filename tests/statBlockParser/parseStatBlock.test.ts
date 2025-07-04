import { describe, it, expect, vi } from 'vitest';
import { statBlockParser } from '../../src/statBlockParser/parseStatBlock';
import { ParsedActor } from '../../src/types/importedActor';
import {
  settingBulletPointIcons,
  settingModifiedSpecialAbs,
} from '../../src/global';
import * as foundryWrappers from '../../src/utils/foundryWrappers';

// Example statblock for integration testing
const exampleStatBlock = `
Test NPC
A test NPC for integration testing. He is just a random thing cobbled 
together to test the parser. 
Attributes: Agility d8, Smarts d6, Spirit d6, Strength d8+2, Vigor d6
Skills: Fighting d8, Shooting d6, Notice d6
Pace: 6; Parry: 6; Toughness: 7 (1)
Edges: Alertness, Quick
Hindrances: Arrogant, Evil Bastard
Powers: Bolt (2d6). Power Points: 10
Gear: Long sword (Str+d8), bow (Range
12/24/48, Damage 2d6), leather armor (+1).
num Stat: 99
text Stat: some text for testing
die Stat: d6+5
Special Abilities:
• Infravision: Halve penalties for
Illumination when attacking warm
targets.
• Size −1: Goblins are the size of small
children.
`;

const expectedParsedActor: ParsedActor = {
  name: 'Test Npc',
  biography:
    'A test NPC for integration testing. He is just a random thing cobbled together to test the parser.<br/>',
  attributes: {
    agility: {
      die: {
        sides: 8,
        modifier: 0,
      },
    },
    smarts: {
      die: {
        sides: 6,
        modifier: 0,
      },
      animal: false,
    },
    spirit: {
      die: {
        sides: 6,
        modifier: 0,
      },
    },
    strength: {
      die: {
        sides: 8,
        modifier: 2,
      },
    },
    vigor: {
      die: {
        sides: 6,
        modifier: 0,
      },
    },
  },
  skills: {
    fighting: {
      sides: 8,
      modifier: 0,
    },
    shooting: {
      sides: 6,
      modifier: 0,
    },
    notice: {
      sides: 6,
      modifier: 0,
    },
  },
  pace: 6,
  toughness: {
    value: 7,
    modifier: 0,
    armor: 1,
  },
  parry: 6,
  powerPoints: 10,
  edges: ['Alertness', 'Quick'],
  hindrances: ['Arrogant', 'Evil Bastard'],
  powers: ['Bolt (2d6)'],
  specialAbilities: {
    Infravision:
      'Halve penalties for Illumination when attacking warm targets.',
    'Size -1': 'Goblins are the size of small children.',
  },
  superPowers: {},
  gear: {
    'Long sword': {
      damage: 'Str+d8',
    },
    bow: {
      range: '12/24/48',
      damage: '2d6',
    },
    'leather armor': {
      armorBonus: 1,
    },
  },
  size: -1,
  'die Stat': {
    modifier: 5,
    sides: 6,
  },
  'num Stat': 99,
  'text Stat': 'some text for testing',
};

vi.mock('../../src/utils/foundryActions', async () => {
  const actual = await vi.importActual<
    typeof import('../../src/utils/foundryActions')
  >('../../src/utils/foundryActions');
  return {
    ...actual,
    getActorAddtionalStatsArray: () => ['num Stat', 'text Stat', 'die Stat'],
    getActorAddtionalStats: () => ({
      numStat: { label: 'num Stat', dtype: 'Number', hasMaxValue: true },
      dieStat: { label: 'die Stat', dtype: 'Die' },
      textStat: { label: 'text Stat', dtype: 'String', hasMaxValue: false },
    }),
    getModuleSettings: (key: string) => {
      if (key === settingBulletPointIcons) return '•';
      if (key === settingModifiedSpecialAbs) return false;
    },
  };
});

describe('statBlockParser integration', () => {
  it('parses a valid statblock and returns a ParsedActor object', async () => {
    const result = await statBlockParser(exampleStatBlock);
    expect(result).toEqual(expectedParsedActor);
  });

  it('should throw an error and call foundryUiError on invalid input', async () => {
    const foundryUiErrorSpy = vi.spyOn(foundryWrappers, 'foundryUiError');
    const expectedError = foundryWrappers.foundryI18nLocalize(
      'npcImporter.parser.NotValidStablock',
    );

    await expect(statBlockParser('bad input')).rejects.toThrow(expectedError);
    expect(foundryUiErrorSpy).toHaveBeenCalledWith(expectedError);
  });
});
