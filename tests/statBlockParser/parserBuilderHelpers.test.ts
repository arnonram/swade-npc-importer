import {
  GetMeleeDamage,
  getArmorBonus,
  getBonus,
} from '../../src/statBlockParser/parserBuilderHelpers';
import { describe, it, expect } from 'vitest';

describe('GetMeleeDamage', () => {
  it('extracts basic melee damage', () => {
    const result = GetMeleeDamage('Attacks with Str+d6');
    expect(result).toBe('@str+d6');
  });

  it('handles missing dice', () => {
    const result = GetMeleeDamage('Deals Str+2');
    expect(result).toBe('@str+2');
  });

  it('removes trailing period', () => {
    const result = GetMeleeDamage('Slash: Str+d8.');
    expect(result).toBe('@str+d8');
  });

  it('returns empty if nothing matches', () => {
    const result = GetMeleeDamage('Deals psychic damage.');
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
    expect(getBonus('Parry: +2', 'parry')).toBe(2);
    expect(getBonus('+3 Parry', 'parry')).toBe(3);
  });

  it('extracts cover bonus', () => {
    expect(getBonus('Cover +50', 'cover')).toBe(50);
  });

  it('extracts power points', () => {
    expect(getBonus('Power Points: 15', 'powerPoints')).toBe(15);
  });

  it('returns undefined on missing or malformed bonus', () => {
    expect(getBonus('AP +2', 'parry')).toBeUndefined();
    expect(getBonus('', 'cover')).toBeUndefined();
    expect(getBonus('Cover', 'cover')).toBeUndefined();
  });
});
