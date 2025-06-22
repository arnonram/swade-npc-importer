import { describe, it, expect, beforeEach, vi } from 'vitest';
import { buildActorData } from '../../src/dataBuilders/buildActorData';
import * as foundryActions from '../../src/utils/foundryActions';
import * as foundryWrappers from '../../src/utils/foundryWrappers';

// Mock i18n and Foundry settings
vi.mock('../../src/utils/foundryActions', async () => {
  const actual = await vi.importActual<any>('../../src/utils/foundryActions');
  return {
    ...actual,
    getActorAddtionalStatsArray: () => [],
    getModuleSettings: vi.fn(key => {
      if (key === 'autoCalcToughness') return false;
      if (key === 'calculateAdditionalWounds') return false;
      if (key === 'calculateIgnoredWounds') return false;
      if (key === 'numberOfBennies') return 2;
      return undefined;
    }),
  };
});

describe('buildActorData', () => {
  let parsedData: any;

  beforeEach(() => {
    parsedData = {
      attributes: {
        agility: { die: 6 },
        smarts: { die: 6 },
        spirit: { die: 6 },
        strength: { die: 6 },
        vigor: { die: 6 },
      },
      toughness: 5,
      parry: 6,
      size: 0,
      pace: 6,
      biography: 'A test biography',
      powerpoints: 10,
      specialabilities: {},
      edges: [],
      hindrances: [],
    };
  });

  it('should build basic system data for an NPC wildcard', async () => {
    const result = await buildActorData(parsedData, true, 'npc');
    expect(result.stats.toughness.value).toBe(5);
    expect(result.stats.parry.value).toBe(6);
    expect(result.wildcard).toBe(true);
    expect(result.bennies.value).toBe(2);
    expect(result.details.biography.value).toBe('A test biography');
    expect(result.powerPoints.general.value).toBe(10);
  });

  it('should build correct bennies for a character wildcard', async () => {
    const result = await buildActorData(parsedData, true, 'character');
    expect(result.bennies.value).toBe(3);
  });

  it('should build correct bennies for a non-wildcard', async () => {
    const result = await buildActorData(parsedData, false, 'npc');
    expect(result.bennies.value).toBe(0);
  });

  it('should handle special abilities for wounds and bonuses', async () => {
    parsedData.specialabilities = {
      '@saResilient': 'Resilient',
      '@saVeryResilient': 'VeryResilient',
    };
    // Enable additional wounds in settings
    (foundryActions.getModuleSettings as any).mockImplementation(key => {
      if (key === 'calculateAdditionalWounds') return true;
      if (key === 'numberOfBennies') return 2;
      return false;
    });
    const result = await buildActorData(parsedData, true, 'npc');
    expect(result.wounds.max).toBeGreaterThan(3); // Should be 3 + bonuses
  });
});
