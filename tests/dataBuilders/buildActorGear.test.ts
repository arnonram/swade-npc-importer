import { describe, it, expect, vi } from 'vitest';
import { itemGearBuilder } from '../../src/dataBuilders/buildActorGear';

vi.mock('../../src/dataBuilders/itemBuilders', () => ({
  weaponBuilder: vi.fn(async args => ({ type: 'weapon', ...args })),
  armorBuilder: vi.fn(async (name, armorBonus, desc) => ({
    type: 'armor',
    name,
    armorBonus,
    desc,
  })),
  gearBuilder: vi.fn(async name => ({ type: 'gear', name })),
  shieldBuilder: vi.fn(async (name, desc, parry, cover) => ({
    type: 'shield',
    name,
    desc,
    parry,
    cover,
  })),
}));

import * as itemBuilders from '../../src/dataBuilders/itemBuilders';

describe('itemGearBuilder', () => {
  it('builds misc gear', async () => {
    const result = await itemGearBuilder({ Rope: null });
    expect(result).toEqual([{ type: 'gear', name: 'Rope' }]);
    expect(itemBuilders.gearBuilder).toHaveBeenCalledWith('Rope');
  });

  it('builds weapon', async () => {
    const result = await itemGearBuilder({
      Sword: { damage: 'Str+d6', range: null, rof: 1, ap: 0, shots: 0 },
    });
    expect(result[0]).toMatchObject({
      type: 'weapon',
      weaponName: 'Sword',
      weaponDamage: 'Str+d6',
    });
    expect(itemBuilders.weaponBuilder).toHaveBeenCalled();
  });

  it('builds armor', async () => {
    const result = await itemGearBuilder({ Chainmail: { armorBonus: 2 } });
    expect(result[0]).toMatchObject({
      type: 'armor',
      name: 'Chainmail',
      armorBonus: 2,
    });
    expect(itemBuilders.armorBuilder).toHaveBeenCalled();
  });

  it('builds shield', async () => {
    const result = await itemGearBuilder({ Shield: { parry: 1, cover: 2 } });
    expect(result[0]).toMatchObject({
      type: 'shield',
      name: 'Shield',
      parry: 1,
      cover: 2,
    });
    expect(itemBuilders.shieldBuilder).toHaveBeenCalled();
  });

  it('handles mixed gear', async () => {
    const result = await itemGearBuilder({
      Sword: { damage: 'Str+d6', range: null, rof: 1, ap: 0, shots: 0 },
      Chainmail: { armorBonus: 2 },
      Shield: { parry: 1, cover: 2 },
      Rope: null,
    });
    expect(result).toHaveLength(4);
    expect(result.some(i => i.type === 'weapon')).toBe(true);
    expect(result.some(i => i.type === 'armor')).toBe(true);
    expect(result.some(i => i.type === 'shield')).toBe(true);
    expect(result.some(i => i.type === 'gear')).toBe(true);
  });
});
