import { describe, it, expect } from 'vitest';
import {
  getListStat,
  getProsePowers,
  ListType,
} from '../../src/statBlockParser/getListsStats';

describe('getListStat', () => {
  it('extracts hindrances list from sections', () => {
    const sections = ['Hindrances: Bloodthirsty, Vengeful (Minor)'];
    const result = getListStat(sections, ListType.Hindrances);
    expect(result).toEqual(['Bloodthirsty', 'Vengeful (Minor)']);
  });

  it('extracts edges list with parens', () => {
    const sections = ['Edges: Berserk, Sweep (Imp), Combat Reflexes'];
    const result = getListStat(sections, ListType.Edges);
    expect(result).toEqual(['Berserk', 'Sweep (Imp)', 'Combat Reflexes']);
  });

  it('extracts powers list with punctuation and accents', () => {
    const sections = ['Powers: Arcane protection, Detect/Conceal Arcana, Bolt'];
    const result = getListStat(sections, ListType.Powers);
    expect(result).toEqual([
      'Arcane protection',
      'Detect',
      'Conceal Arcana',
      'Bolt',
    ]);
  });

  it('returns empty array if label not found', () => {
    const sections = ['Attributes: Smarts d6, Strength d8'];
    const result = getListStat(sections, ListType.Hindrances);
    expect(result).toEqual([]);
  });

  it('handles trailing punctuation correctly', () => {
    const sections = ['Edges: Alertness, Quick, Brave.'];
    const result = getListStat(sections, ListType.Edges);
    expect(result).toEqual(['Alertness', 'Quick', 'Brave']);
  });

  it('handles new lines in line', () => {
    const sections = ['Powers: Bolt,\nDetect Arcana,\nInvisibility'];
    const result = getListStat(sections, ListType.Powers);
    expect(result).toEqual(['Bolt', 'Detect Arcana', 'Invisibility']);
  });
});

describe('getProsePowers', () => {
  it('returns the Powers text when it is a sentence, not a list', () => {
    const sections = [
      'Powers: As magical beings, Jinni have access to all spells, or as the Game Master\ndeems appropriate.',
    ];
    expect(getProsePowers(sections)).toBe(
      'Powers: As magical beings, Jinni have access to all spells, or as the Game Master deems appropriate.',
    );
  });

  it('returns undefined for a regular powers list, including trappings', () => {
    const sections = [
      'Powers: Bolt (fire, ice and lightning), Boost/Lower Trait, Environmental Protection',
    ];
    expect(getProsePowers(sections)).toBeUndefined();
  });

  it('returns undefined when there is no Powers section', () => {
    expect(getProsePowers(['Edges: Berserk'])).toBeUndefined();
  });
});
