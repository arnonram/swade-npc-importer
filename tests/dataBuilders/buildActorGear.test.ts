import { describe, it, expect, vi, beforeEach } from 'vitest';
import { itemGearBuilder } from '../../src/dataBuilders/buildActorGear';

vi.mock('../../src/dataBuilders/itemBuilder', () => ({
  gearBuilder: vi.fn(),
  weaponBuilder: vi.fn(),
  armorBuilder: vi.fn(),
  shieldBuilder: vi.fn(),
}));

import {
  gearBuilder,
  weaponBuilder,
  armorBuilder,
  shieldBuilder,
} from '../../src/dataBuilders/itemBuilder';

describe('itemGearBuilder', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns empty array for null or non-object input', async () => {
    expect(await itemGearBuilder(null as any)).toEqual([]);
    expect(await itemGearBuilder(undefined as any)).toEqual([]);
    expect(await itemGearBuilder('invalid' as any)).toEqual([]);
  });

  it('builds misc gear (null entry)', async () => {
    (gearBuilder as any).mockResolvedValue({ name: 'Sunglasses' });

    const result = await itemGearBuilder({ Sunglasses: null });

    expect(gearBuilder).toHaveBeenCalledWith('Sunglasses');
    expect(result).toEqual([{ name: 'Sunglasses' }]);
  });

  it('builds weapon with damage and range', async () => {
    (weaponBuilder as any).mockResolvedValue({ name: 'Great Axe' });

    const result = await itemGearBuilder({
      'Great Axe': {
        damage: 'Str+d10',
        range: 'melee',
        rof: 1,
        ap: 2,
        shots: 1,
      },
    });

    expect(weaponBuilder).toHaveBeenCalledWith({
      weaponName: 'Great Axe',
      weaponDescription: 'Great Axe',
      weaponDamage: 'Str+d10',
      range: 'melee',
      rof: 1,
      ap: 2,
      shots: 1,
    });
    expect(result).toEqual([{ name: 'Great Axe' }]);
  });

  it('builds armor with armorBonus', async () => {
    (armorBuilder as any).mockResolvedValue({ name: 'Chainmail' });

    const result = await itemGearBuilder({
      Chainmail: { armorBonus: 4 },
    });

    expect(armorBuilder).toHaveBeenCalledWith('Chainmail', 4, 'Chainmail');
    expect(result).toEqual([{ name: 'Chainmail' }]);
  });

  it('builds shield with parry and cover', async () => {
    (shieldBuilder as any).mockResolvedValue({ name: 'Wooden Shield' });

    const result = await itemGearBuilder({
      'Wooden Shield': { parry: 1, cover: 2 },
    });

    expect(shieldBuilder).toHaveBeenCalledWith(
      'Wooden Shield',
      'Wooden Shield',
      1,
      2,
    );
    expect(result).toEqual([{ name: 'Wooden Shield' }]);
  });

  it('builds mixed gear items correctly', async () => {
    (gearBuilder as any).mockResolvedValue({ name: 'Rope' });
    (weaponBuilder as any).mockResolvedValue({ name: 'Sword' });
    (armorBuilder as any).mockResolvedValue({ name: 'Leather' });
    (shieldBuilder as any).mockResolvedValue({ name: 'Shield' });

    const result = await itemGearBuilder({
      Rope: null,
      Sword: { damage: 'Str+d6' },
      Leather: { armorBonus: 2 },
      Shield: { parry: 1, cover: 1 },
    });

    expect(result).toEqual([
      { name: 'Rope' },
      { name: 'Sword' },
      { name: 'Leather' },
      { name: 'Shield' },
    ]);
  });
});
