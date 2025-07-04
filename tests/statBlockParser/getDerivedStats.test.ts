import {
  getDerivedStats,
  getSize,
  powerPointsFromSpecialAbility,
  DerivedStatType,
  getToughness,
} from '../../src/statBlockParser/getDerivedStats';

import { describe, expect, it, vi } from 'vitest';

vi.mock('../../src/utils/parserBuilderHelpers', () => ({
  getBonus: vi.fn((desc: string, _key: string) => {
    const match = desc.match(/Power\s*Points\s*[:\-]?\s*(\d+)/i);
    return match ? parseInt(match[1]) : undefined;
  }),
}));

describe('getDerivedStats', () => {
  it('should extract numeric value from matching section', () => {
    const sections = ['Pace: 6', 'Parry: 5'];
    expect(getDerivedStats(sections, DerivedStatType.Pace)).toBe(6);
    expect(getDerivedStats(sections, DerivedStatType.Parry)).toBe(5);
  });

  it('returns undefined if label is not present', () => {
    const sections = ['Attributes: Agility d8'];
    expect(getDerivedStats(sections, DerivedStatType.Pace)).toBe(0);
  });

  it('handles malformed stat line gracefully', () => {
    const sections = ['Pace - fast'];
    expect(getDerivedStats(sections, DerivedStatType.Pace)).toBe(0);
  });
});

describe('getToughness', () => {
  const label = 'Toughness';

  it.each([
    // [input, expected]
    [[`${label}: 6(2)`], { value: 6, modifier: 0, armor: 2 }],
    [[`${label}: 6 (2)`], { value: 6, modifier: 0, armor: 2 }],
    [[`${label}: 6(2);`], { value: 6, modifier: 0, armor: 2 }],
    [[`${label}: 6 (2);`], { value: 6, modifier: 0, armor: 2 }],
    [[`${label}: 5`], { value: 5, modifier: 0, armor: 0 }],
    [[`${label}: 5;`], { value: 5, modifier: 0, armor: 0 }],
    [['Parry: 7'], { value: 0, modifier: 0, armor: 0 }],
    [[`${label}: foo(bar)`], { value: 0, modifier: 0, armor: 0 }],
  ])('parses %j as %j', (input, expected) => {
    expect(getToughness(input)).toEqual(expected);
  });
});

describe('getSize', () => {
  it.each([
    [{ 'Size +2': '', Fear: '' }, 2, 'extracts positive size'],
    [{ 'Size -1': '', Fear: '' }, -1, 'extracts negative size'],
    [{ 'Size -3': '', Fear: '' }, -3, 'extracts large negative size'],
    [{ 'Size Unknown': '' }, 0, 'returns 0 if size cannot be parsed'],
    [{ Fear: '' }, 0, 'returns 0 if size key is not present'],
  ])('returns %i for %j (%s)', (abilities, expected, _desc) => {
    expect(getSize(abilities)).toBe(expected);
  });
});

describe('powerPointsFromSpecialAbility', () => {
  it('extracts powerPoints from matching ability description', () => {
    const abilities = {
      Magic: {
        system: {
          grantsPowers: true,
          description: 'Power Points: 15',
        },
      },
    };
    expect(powerPointsFromSpecialAbility(abilities)).toBe(15);
  });

  it('returns undefined if no matching grant found', () => {
    const abilities = {
      Fear: {
        system: { grantsPowers: false },
      },
    };
    expect(powerPointsFromSpecialAbility(abilities)).toBeUndefined();
  });
});
