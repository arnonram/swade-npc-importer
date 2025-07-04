import { describe, it, expect, vi } from 'vitest';
import { getGear } from '../../src/statBlockParser/getGear';

vi.mock('../../src/global', async mod => ({
  ...mod,
  newLineRegex: /\n/g,
  gearParsingRegex: /[^,]+?\([^)]*\)|[^,]+/g,
  armorModRegex: /\+\d+ Armor|\d+ Armor/gi,
}));

vi.mock('../../src/utils/parserBuilderHelpers', async mod => ({
  ...(await mod),
  getBonus: vi.fn((input: string, type: string) => {
    if (type === 'parry') return input.includes('-1 Parry') ? -1 : 0;
    if (type === 'cover') return input.includes('2 Cover') ? 2 : 0;
    return 0;
  }),
  getArmorBonus: vi.fn((input: string) => (input.includes('+2') ? 2 : 0)),
}));

describe('getGear()', () => {
  it('parses weapon with multiple stats', async () => {
    const result = await getGear([
      'Gear: Great Axe (Str+d10, -1 Parry, 2 hands), Healing Kit',
    ]);

    expect(result).toEqual({
      'Great Axe': {
        damage: 'Str+d10',
      },
      'Healing Kit': null,
    });
  });

  it('parses armor gear', async () => {
    const result = await getGear([
      'Gear: Leather Armor (+2 Armor), Sunglasses',
    ]);

    expect(result).toEqual({
      'Leather Armor': {
        armorBonus: 2,
      },
      Sunglasses: null,
    });
  });

  it('parses shield with parry and cover', async () => {
    const result = await getGear(['Gear: Wooden Shield (+2 Cover, -1 Parry)']);

    expect(result).toEqual({
      'Wooden Shield': {
        parry: -1,
        cover: 2,
      },
    });
  });

  it('handles gear without stats', async () => {
    const result = await getGear(['Gear: Flashlight, Bedroll, Rope']);

    expect(result).toEqual({
      Flashlight: null,
      Bedroll: null,
      Rope: null,
    });
  });

  it('returns empty Gear object if no matching gear section', async () => {
    const result = await getGear(['Attributes: Agility d6']);
    expect(result).toEqual({});
  });
});
