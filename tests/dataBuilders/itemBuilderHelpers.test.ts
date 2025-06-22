import { describe, it, expect, vi } from 'vitest';
import {
  checkSpecificItem,
  rearrangeImprovedEdges,
  generateDescription,
  checkEquipedStatus,
  checkforItem,
  buildItemObject,
} from '../../src/dataBuilders/itemBuilderHelpers';
import { ItemType } from '../../src/types/enums';

vi.mock('../../src/utils/foundryActions', () => ({
  getModuleSettings: vi.fn(() => 'Two Hands'),
  getItemFromCompendium: vi.fn(async (name, type) => ({
    name,
    type,
    system: { description: 'desc', notes: 'notes' },
    effects: { toJSON: () => ['effect'] },
    flags: { flag: true },
  })),
}));

vi.mock('../../src/utils/textUtils', () => ({
  specialAbilitiesLink: (name: string) => `link:${name}`,
}));

describe('itemBuilderHelpers', () => {
  it('checkSpecificItem returns match or original', () => {
    expect(checkSpecificItem('Armor')).toBe('Armor');
    expect(checkSpecificItem('Random')).toBe('Random');
  });

  it('rearrangeImprovedEdges rearranges edge names', () => {
    expect(rearrangeImprovedEdges('Edge (Imp)')).toMatch(/Improved/);
    expect(rearrangeImprovedEdges('Normal Edge')).toBe('Normal Edge');
  });

  it('generateDescription returns correct string', () => {
    expect(
      generateDescription('desc', {
        name: 'Test',
        system: { description: 'sysdesc' },
      }),
    ).toMatch('desc');
    expect(
      generateDescription(
        'desc',
        { name: 'Test', system: { description: 'sysdesc' } },
        true,
      ),
    ).toMatch('link:Test');
  });

  it('checkEquipedStatus returns correct status', () => {
    expect(checkEquipedStatus({ description: 'Two Hands', notes: '' })).toBe(5);
    expect(checkEquipedStatus({ description: '', notes: '' })).toBe(4);
  });

  it('buildItemObject merges fields correctly', () => {
    const item = buildItemObject({
      item: {
        name: 'Sword',
        system: { description: 'desc' },
        effects: { toJSON: () => ['fx'] },
        flags: { flag: true },
      },
      type: ItemType.WEAPON,
      name: 'Sword',
      img: 'img.svg',
      system: { extra: 1 },
    });
    expect(item.type).toBe('weapon');
    expect(item.name).toBe('Sword');
    expect(item.img).toBe('img.svg');
    expect(item.system.extra).toBe(1);
    expect(item.effects).toContain('fx');
    expect(item.flags.flag).toBe(true);
  });

  it('checkforItem returns item from compendium', async () => {
    const item = await checkforItem('Sword', ItemType.WEAPON);
    expect(item.name).toBe('Sword');
    expect(item.type).toBe('weapon');
  });
});
