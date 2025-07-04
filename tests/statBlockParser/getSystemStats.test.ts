import { describe, it, expect, vi } from 'vitest';
import { getSystemDefinedStats } from '../../src/statBlockParser/getSystemStats';

vi.mock('../../src/utils/foundryActions', () => ({
  getActorAddtionalStats: () => ({
    Conviction: { label: 'Sanity', dtype: 'Die' },
    Rank: { label: 'Rank', dtype: 'String' },
    XP: { label: 'XP', dtype: 'Number' },
  }),
}));

describe('getSystemDefinedStats', () => {
  it('parses stats of different types correctly', () => {
    const sections = ['Sanity: d6-1', 'Rank: Veteran', 'XP: 40'];

    const result = getSystemDefinedStats(sections);

    expect(result).toEqual({
      Sanity: { sides: 6, modifier: -1 },
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
    const sections = ['Rank Veteran'];
    const result = getSystemDefinedStats(sections);
    expect(result).toEqual({});
  });

  it('parses with extra symbols and dash normalization', () => {
    const sections = ['Rank: Hero - Veteran'];
    const result = getSystemDefinedStats(sections);
    expect(result).toEqual({
      Rank: 'Hero - Veteran',
    });
  });
});
