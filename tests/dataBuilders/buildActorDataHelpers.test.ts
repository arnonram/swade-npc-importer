import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as helpers from '../../src/dataBuilders/buildActorDataHelpers';
import * as foundryActions from '../../src/utils/foundryActions';
import { settingCalculateAdditionalWounds } from '../../src/global';
import { calculateBennies } from '../../src/dataBuilders/buildActorDataHelpers';

const {
  calculateIgnoredWounds,
  findUnshakeBonus,
  toughnessBonus,
  initiativeMod,
  findRunningDie,
  findRunningMod,
} = helpers;

describe('buildActorDataHelpers', () => {
  describe('calculateIgnoredWounds', () => {
    it.each([
      [
        {
          specialabilities: {
            Undead: '',
            Construct: '',
            Elemental: '',
            Other: '',
          },
        },
        true,
        3,
      ],
      [{ specialabilities: { Undead: '' } }, true, 1],
      [{ specialabilities: { Other: '' } }, true, 0],
      [{ specialabilities: { Undead: '' } }, false, 0],
    ])('returns %i for %j with setting %j', (parsed, setting, expected) => {
      vi.spyOn(foundryActions, 'getModuleSettings').mockReturnValue(setting);
      expect(calculateIgnoredWounds(parsed as any)).toBe(expected);
    });
  });

  describe('findUnshakeBonus', () => {
    it.each([
      [
        {
          specialabilities: {
            Undead: 'undead ability',
            Construct: 'construct ability',
          },
          edges: ['Combat Reflexes'],
        },
        6,
      ],
      [{ specialabilities: { Undead: 'undead ability' }, edges: [] }, 2],
      [{ specialabilities: {}, edges: ['Combat Reflexes'] }, 2],
      [{ specialabilities: {}, edges: [] }, 0],
    ])('returns %i for %j', (parsed, expected) => {
      expect(findUnshakeBonus(parsed as any)).toBe(expected);
    });
  });

  describe('toughnessBonus', () => {
    it.each([
      [
        {
          specialabilities: {
            Undead: 'undead ability',
          },
          edges: ['Brawler', 'Bruiser'],
        },
        4,
      ],
      [{ specialabilities: {}, edges: [] }, 0],
      [{ specialabilities: {}, edges: ['Brawny'] }, 1],
      [{ specialabilities: {}, edges: ['Brawler', 'Brawny'] }, 2],
      [{ specialabilities: {}, edges: ['Brawler', 'Brawny', 'Bruiser'] }, 3],
    ])('returns %i for %j', (parsed, expected) => {
      expect(toughnessBonus(parsed as any)).toBe(expected);
    });
  });

  describe('initiativeMod', () => {
    it.each([
      [
        {
          edges: ['Level Headed (Imp)', 'Level Headed', 'Quick'],
          hindrances: ['Hesitant'],
        },
        {
          hasHesitant: true,
          hasLevelHeaded: true,
          hasImpLevelHeaded: true,
          hasQuick: true,
        },
      ],
      [
        { edges: [], hindrances: [] },
        {
          hasHesitant: false,
          hasLevelHeaded: false,
          hasImpLevelHeaded: false,
          hasQuick: false,
        },
      ],
      [
        { edges: ['Quick'], hindrances: [] },
        {
          hasHesitant: false,
          hasLevelHeaded: false,
          hasImpLevelHeaded: false,
          hasQuick: true,
        },
      ],
      [
        { edges: [], hindrances: ['Hesitant'] },
        {
          hasHesitant: true,
          hasLevelHeaded: false,
          hasImpLevelHeaded: false,
          hasQuick: false,
        },
      ],
    ])('returns %j for %j', (parsed, expected) => {
      expect(initiativeMod(parsed as any)).toEqual(expected);
    });
  });

  describe('findRunningDie', () => {
    it('returns die from specialabilities if Speed present', () => {
      const parsed = {
        specialabilities: {
          Speed: 'd8',
        },
        edges: [],
      };
      vi.spyOn(foundryActions, 'getModuleSettings').mockReturnValue(true);
      vi.spyOn(RegExp.prototype, 'test').mockReturnValue(true);
      expect(findRunningDie(parsed as any)).toBe(8);
    });
    it('returns increased die if Fleet-Footed edge present', () => {
      const parsed = {
        specialabilities: {},
        edges: ['Fleet-Footed'],
      };
      expect(findRunningDie(parsed as any)).toBe(8);
    });
    it('returns default die if nothing matches', () => {
      const parsed = { specialabilities: {}, edges: [] };
      expect(findRunningDie(parsed as any)).toBe(6);
    });
  });

  describe('findRunningMod', () => {
    it('returns correct running die mod if Fleet-Footed edge present', () => {
      const parsed = {
        edges: ['Fleet-Footed'],
      };
      expect(findRunningMod(parsed as any)).toBe(2);
    });
    it('returns 0 if nothing matches', () => {
      const parsed = { edges: [] };
      expect(findRunningMod(parsed as any)).toBe(0);
    });
  });

  describe('calculateWoundMod', () => {
    const { calculateWoundMod } = helpers;
    const Resilient = 'Resilient';
    const VeryResilient = 'Very Resilient';

    it.each([
      [0, false, {}, false, 0],
      [0, true, {}, false, 3],
      [0, true, { ['Resilient']: '' }, true, 4],
      [4, true, {}, true, 4],
      [8, true, {}, true, 5],
      [12, true, {}, true, 6],
      [4, true, { ['Resilient']: '' }, true, 5],
      [4, true, { ['Very Resilient']: '' }, true, 6],
    ])(
      'size=%i, isWildCard=%j, specialAbs=%j, setting=%j => %i',
      (size, isWildCard, specialAbs, setting, expected) => {
        vi.spyOn(foundryActions, 'getModuleSettings').mockImplementation(
          () => setting,
        );

        expect(calculateWoundMod(size, isWildCard, specialAbs)).toBe(expected);
      },
    );
  });

  describe('calculateBennies', () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    it.each([
      [true, 'npc', 2],
      [true, 'character', 3],
      [false, 'npc', 0],
      [false, 'character', 0],
    ])(
      'returns %i for isWildCard=%j, actorType=%s',
      (isWildCard, actorType, expected) => {
        vi.spyOn(foundryActions, 'getModuleSettings').mockReturnValue(2);
        expect(calculateBennies(isWildCard, actorType)).toEqual({
          value: expected,
          max: expected,
        });
      },
    );
  });

  describe('buildAdditionalStats', () => {
    const { buildAdditionalStats } = helpers;
    it('returns empty object if no additionalStats', async () => {
      vi.spyOn(foundryActions, 'getActorAddtionalStats').mockReturnValue(
        undefined,
      );
      const result = await buildAdditionalStats({} as any);
      expect(result).toEqual({});
    });

    it.each([
      [
        { foo: { label: 'bar', dtype: 'Die' } },
        { bar: { modifier: 2, sides: 8 } },
        {
          foo: {
            label: 'bar',
            dtype: 'Die',
            modifier: 2,
            value: 'd8',
          },
        },
      ],
      [
        { foo: { label: 'bar', dtype: 'Number', hasMaxValue: true } },
        { bar: 5 },
        {
          foo: {
            label: 'bar',
            dtype: 'Number',
            hasMaxValue: true,
            max: 5,
            value: 5,
          },
        },
      ],
      [
        { foo: { label: 'bar', dtype: 'Number', hasMaxValue: false } },
        { bar: 7 },
        {
          foo: {
            label: 'bar',
            dtype: 'Number',
            hasMaxValue: false,
            max: undefined,
            value: 7,
          },
        },
      ],
      [
        { foo: { label: 'bar', dtype: 'String' } },
        { bar: 'baz' },
        { foo: { label: 'bar', dtype: 'String', value: 'baz' } },
      ],
      [
        { foo: { label: 'bar', dtype: 'String' } },
        {},
        { foo: { label: 'bar', dtype: 'String' } },
      ],
      [
        { foo: { label: 'bar', dtype: 'Number' } },
        {},
        { foo: { label: 'bar', dtype: 'Number' } },
      ],
    ])(
      'handles additionalStats=%j and parsedData=%j',
      async (additionalStats, parsedData, expected) => {
        vi.spyOn(foundryActions, 'getActorAddtionalStats').mockReturnValue(
          structuredClone(additionalStats),
        );
        const result = await buildAdditionalStats(parsedData as any);
        expect(result).toEqual(expected);
      },
    );
  });
});
