import { describe, it, expect, vi } from 'vitest';
import { getSystemDefinedStats } from '../../src/statBlockParser/getSystemStats';

vi.mock('../../src/utils/foundryActions', () => ({
  getActorAddtionalStats: () => ({
    Conviction: { label: 'Conviction', dtype: 'Boolean' },
    Rank: { label: 'Rank', dtype: 'String' },
    XP: { label: 'XP', dtype: 'Number' },
  }),
}));

describe('getSystemDefinedStats', () => {
  it('parses stats of different types correctly', () => {
    const sections = ['Conviction: true', 'Rank: Veteran', 'XP: 40'];

    const result = getSystemDefinedStats(sections);

    expect(result).toEqual({
      Conviction: true,
      Rank: 'Veteran',
      XP: 40,
    });
  });

  it('ignores missing stats gracefully', () => {
    const sections = ['XP: 25'];
    const result = getSystemDefinedStats(sections);
    expect(result).toEqual({ XP: 25 });
  });

  it('handles malformed input gracefully', () => {
    const sections = ['Rank Veteran']; // missing colon
    const result = getSystemDefinedStats(sections);
    expect(result).toEqual({});
  });

  it('parses with extra symbols and dash normalization', () => {
    const sections = ['XP: 30;', 'Conviction: true;', 'Rank: Hero - Veteran'];
    const result = getSystemDefinedStats(sections);
    expect(result).toEqual({
      XP: 30,
      Conviction: true,
      Rank: 'Hero - Veteran',
    });
  });
});
