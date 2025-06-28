import {
  getMeleeDamage,
  getArmorBonus,
  getBonus,
  buildTraitDie,
} from '../../src/statBlockParser/parserBuilderHelpers';
import { describe, it, expect } from 'vitest';
import { BonusType } from '../../src/types/enums';

describe('GetMeleeDamage', () => {
  it('extracts basic melee damage', () => {
    const result = getMeleeDamage('Attacks with Str+d6');
    expect(result).toBe('@str+d6');
  });

  it('handles missing dice', () => {
    const result = getMeleeDamage('Deals Str+2');
    expect(result).toBe('@str+2');
  });

  it('removes trailing period', () => {
    const result = getMeleeDamage('Slash: Str+d8.');
    expect(result).toBe('@str+d8');
  });

  it('returns empty if nothing matches', () => {
    const result = getMeleeDamage('Deals psychic damage.');
    expect(result).toBe('@');
  });
});

describe('getArmorBonus', () => {
  it('extracts armor bonus correctly', () => {
    expect(getArmorBonus('leather armor (+2)')).toBe(2);
    expect(getArmorBonus('chainmail (+4)')).toBe(4);
  });

  it('returns 0 if no bonus found', () => {
    expect(getArmorBonus('sunglasses')).toBe(0);
  });

  it('handles non-numeric values gracefully', () => {
    expect(getArmorBonus('weird armor (+abc)')).toBe(0);
  });
});

describe('getBonus', () => {
  it('extracts parry bonus', () => {
    expect(getBonus('Parry: +2', BonusType.PARRY)).toBe(2);
    expect(getBonus('+3 Parry', BonusType.PARRY)).toBe(3);
  });

  it('extracts cover bonus', () => {
    expect(getBonus('Cover +50', BonusType.COVER)).toBe(50);
  });

  it('extracts power points', () => {
    expect(getBonus('Power Points: 15', BonusType.POWERPOINTS)).toBe(15);
  });

  it('returns undefined on missing or malformed bonus', () => {
    expect(getBonus('AP +2', BonusType.PARRY)).toBeUndefined();
    expect(getBonus('', BonusType.COVER)).toBeUndefined();
    expect(getBonus('Cover', BonusType.COVER)).toBeUndefined();
  });
});

describe('buildTraitDie', () => {
  it.each([
    ['d6', { sides: 6, modifier: 0 }],
    ['d8+5', { sides: 8, modifier: 5 }],
    ['d8-1', { sides: 8, modifier: -1 }],
    ['not a die', { sides: 0, modifier: 0 }],
    [' d6 + 3 ', { sides: 6, modifier: 3 }],
    ['5', { sides: 0, modifier: 0 }],
    ['d8 + 2', { sides: 8, modifier: 2 }],
    ['d8 -2', { sides: 8, modifier: -2 }],
  ])('parses "%s" as %j', (input, expected) => {
    expect(buildTraitDie(input)).toEqual(expected);
  });
});
