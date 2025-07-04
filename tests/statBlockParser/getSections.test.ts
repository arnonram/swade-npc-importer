import { describe, it, expect, vi } from 'vitest';
import { getSections } from '../../src/statBlockParser/getSections';

describe('getSections', () => {
  it('splits a statblock into correct labeled sections', () => {
    const sample = `
        Attributes: Agility d6, Smarts d8
        Skills: Fighting d6, Shooting d8
        Pace: 6; Parry: 5; Toughness: 7 (1)
        Edges: Alertness
        Gear: Sword (Str+d6), Leather Armor (+1)
      `;

    const sections = getSections(sample);

    expect(sections).toHaveLength(7);
    expect(sections[0]).toMatch(/^Attributes:/);
    expect(sections[1]).toMatch(/^Skills:/);
    expect(sections[2]).toMatch(/^Pace:/);
    expect(sections[3]).toMatch(/^Parry:/);
    expect(sections[4]).toMatch(/^Toughness:/);
    expect(sections[5]).toMatch(/^Edges:/);
    expect(sections[6]).toMatch(/^Gear:/);
  });

  it('trims and returns empty if no valid labels found', () => {
    const badInput = 'This has no valid keywords like Attributes or Skills';
    expect(() => getSections(badInput)).toThrow('Not a valid statblock');
  });

  it('can handle newline, carriage return, and slash spacing issues', () => {
    const input = `Attributes: Strength d8\r\nSkills: Fighting d6\nGear: sword / armor`;
    const result = getSections(input);
    expect(result).toHaveLength(3);
    expect(result[2]).toContain('armor');
  });
  it('works with additional stats from getActorAddtionalStatsArray()', () => {
    vi.mock('../../src/utils/foundryActions', () => ({
      getActorAddtionalStatsArray: () => ['CustomStat:', 'CustomStat 2:'],
    }));

    const input = `Attributes: d8\nCustomStat: foo bar\nCustomStat 2: baz qux\nSkills: d6`;
    const result = getSections(input);
    expect(result).toHaveLength(4);
    expect(result.some(r => r.startsWith('CustomStat'))).toBe(true);
  });
});
