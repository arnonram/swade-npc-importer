import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  getAbilityList,
  AbilityType,
} from '../../src/statBlockParser/getAbilities';

import * as foundryActions from '../../src/utils/foundryActions';
import {
  settingBulletPointIcons,
  settingModifiedSpecialAbs,
} from '../../src/global';

beforeEach(() => {
  vi.spyOn(foundryActions, 'getModuleSettings').mockImplementation(key => {
    if (key === settingModifiedSpecialAbs) return false;
    if (key === settingBulletPointIcons) return '•|\\*';
    return '';
  });
});

describe('getAbilityList', () => {
  it('returns a parsed ability record (standard bullets)', () => {
    const input = [
      'Special Abilities: • Fear: Characters must check. • Infravision: Sees heat. • Size -1: Small!',
    ];

    const result = getAbilityList(input, AbilityType.SpecialAbilities);

    expect(result).toEqual({
      Fear: 'Characters must check.',
      Infravision: 'Sees heat.',
      'Size -1': 'Small!',
    });
  });

  it('handles abilities without colons (e.g., name only)', () => {
    const input = ['Special Abilities: • Frenzy'];

    const result = getAbilityList(input, AbilityType.SpecialAbilities);
    expect(result).toEqual({
      Frenzy: 'Frenzy',
    });
  });

  it('returns empty object if ability label is missing', () => {
    const input = ['Attributes: Smarts d8'];
    const result = getAbilityList(input, AbilityType.SpecialAbilities);
    expect(result).toEqual({});
  });

  it('parses @-based syntax if modified special abilities enabled', () => {
    vi.spyOn(foundryActions, 'getModuleSettings').mockImplementation(key => {
      if (key === settingModifiedSpecialAbs) return true;
      return '';
    });

    const input = [
      'Special Abilities: @Fear: Fear aura @Infravision: Sees warm targets',
    ];

    const result = getAbilityList(input, AbilityType.SpecialAbilities);
    expect(result).toEqual({
      '@Fear': 'Fear aura',
      '@Infravision': 'Sees warm targets',
    });
  });

  it('parses Super Powers the same way', () => {
    const input = ['Super Powers: * Bolt: Shoot energy * Flight: Fly fast'];
    const result = getAbilityList(input, AbilityType.SuperPowers);
    expect(result).toEqual({
      Bolt: 'Shoot energy',
      Flight: 'Fly fast',
    });
  });
});
