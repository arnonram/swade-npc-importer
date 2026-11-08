import { describe, it, expect } from 'vitest';
import {
  getListStat,
  getProseList,
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
      'Detect/Conceal Arcana',
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

  it('keeps slash names whole, including across line breaks', () => {
    const sections = [
      'Powers: Arcane protection, blast, boost/\nlower Trait, light / darkness',
    ];
    expect(getListStat(sections, ListType.Powers)).toEqual([
      'Arcane protection',
      'blast',
      'boost/lower Trait',
      'light/darkness',
    ]);
  });

  it('drops a leading "and"/"or" from the last item', () => {
    const sections = ['Powers: light/darkness, and protection.'];
    expect(getListStat(sections, ListType.Powers)).toEqual([
      'light/darkness',
      'protection',
    ]);
  });

  it('keeps a dash note with its item instead of producing an empty entry', () => {
    const sections = [
      'Hindrances: Code of Honor, Loyal,\nObligation (Major) — Serve Lord',
    ];
    expect(getListStat(sections, ListType.Hindrances)).toEqual([
      'Code of Honor',
      'Loyal',
      'Obligation (Major — Serve Lord)',
    ]);
  });

  it('reads a "Spells:" section as powers', () => {
    const sections = ['Spells: Barrier, beast friend, stun.'];
    expect(getListStat(sections, ListType.Powers)).toEqual([
      'Barrier',
      'beast friend',
      'stun',
    ]);
  });

  it('handles new lines in line', () => {
    const sections = ['Powers: Bolt,\nDetect Arcana,\nInvisibility'];
    const result = getListStat(sections, ListType.Powers);
    expect(result).toEqual(['Bolt', 'Detect Arcana', 'Invisibility']);
  });
});

describe('getProseList', () => {
  it('returns the Powers text when it is a sentence, not a list', () => {
    const sections = [
      'Powers: As magical beings, Jinni have access to all spells, or as the Game Master\ndeems appropriate.',
    ];
    expect(getProseList(sections, ListType.Powers)).toBe(
      'Powers: As magical beings, Jinni have access to all spells, or as the Game Master deems appropriate.',
    );
  });

  it('returns undefined for a regular powers list, including trappings', () => {
    const sections = [
      'Powers: Bolt (fire, ice and lightning), Boost/Lower Trait, Environmental Protection',
    ];
    expect(getProseList(sections, ListType.Powers)).toBeUndefined();
  });

  it('returns undefined when there is no Powers section', () => {
    expect(getProseList(['Edges: Berserk'], ListType.Powers)).toBeUndefined();
  });

  it('treats "Various" hindrances as text, not a list', () => {
    expect(getProseList(['Hindrances: Various'], ListType.Hindrances)).toBe(
      'Hindrances: Various',
    );
    expect(
      getProseList(
        ['Hindrances: Various, but Arrogant or Suspicious are common'],
        ListType.Hindrances,
      ),
    ).toBe('Hindrances: Various, but Arrogant or Suspicious are common');
    expect(
      getProseList(['Hindrances: Greedy, Mean'], ListType.Hindrances),
    ).toBeUndefined();
  });
});
