import { describe, it, expect, vi } from 'vitest';
import { getGear, getGearNotes } from '../../src/statBlockParser/getGear';

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

  it('parses weapon stats written with colons', async () => {
    const result = await getGear([
      'Gear: Sling (Range: 4/8/16, Damage: Str+d4), Crossbow (Range: 15/30/60, Damage: 2d6, Shots: 1)',
    ]);

    expect(result).toEqual({
      Sling: { range: '4/8/16', damage: 'Str+d4' },
      Crossbow: { range: '15/30/60', damage: '2d6', shots: '1' },
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

describe('getGearNotes / sentences after the gear list', () => {
  const sections = [
    'Gear: Demonic plate armor (+4), balefire\nlongsword (Str+d8, AP 2), balefire whip\n(Str+d4, Reach 3). Anyone struck by a\nbalefire weapon, whether injured or not, catches fire.',
  ];

  it('keeps the sentence out of the gear items', async () => {
    const gear = await getGear(sections);
    expect(Object.keys(gear)).toEqual([
      'Demonic plate armor',
      'balefire longsword',
      'balefire whip',
    ]);
  });

  it('returns the sentence as notes', () => {
    expect(getGearNotes(sections)).toBe(
      'Anyone struck by a balefire weapon, whether injured or not, catches fire.',
    );
  });

  it('returns undefined when the gear section is only a list', () => {
    expect(
      getGearNotes(['Gear: Short spear (Str+d4), sling.']),
    ).toBeUndefined();
  });
});
