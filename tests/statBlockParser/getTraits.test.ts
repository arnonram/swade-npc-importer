import { describe, it, expect } from 'vitest';
import { getAttributes, getSkills } from '../../src/statBlockParser/getTraits';

describe('getAttributes', () => {
  it('should parse attributes correctly', () => {
    const input = [
      'Attributes: Agility d6, Smarts d8+2, Spirit d6, Strength d10, Vigor d6',
    ];

    const result = getAttributes(input);

    expect(result).toEqual({
      agility: { die: { sides: 6, modifier: 0 } },
      smarts: { die: { sides: 8, modifier: 2 }, animal: false },
      spirit: { die: { sides: 6, modifier: 0 } },
      strength: { die: { sides: 10, modifier: 0 } },
      vigor: { die: { sides: 6, modifier: 0 } },
    });
  });

  it('should detect animal tag (A)', () => {
    const input = [
      'Attributes: Agility d4, Smarts d6 (A), Spirit d6, Strength d6, Vigor d6',
    ];
    const result = getAttributes([input[0].replace(' (A)', '(A)')]);

    expect(result.smarts.animal).toBe(true);
  });

  it('should return empty if no Attributes section is present', () => {
    const result = getAttributes(['Something else entirely']);
    expect(result).toEqual({});
  });
});

describe('getSkills', () => {
  it('should parse multiple skills with modifiers', () => {
    const input = ['Skills: Athletics d6, Stealth d8+2, Notice d4'];

    const result = getSkills(input);

    expect(result).toEqual({
      athletics: { sides: 6, modifier: 0 },
      stealth: { sides: 8, modifier: 2 },
      notice: { sides: 4, modifier: 0 },
    });
  });

  it('should return empty object if skills section missing', () => {
    const result = getSkills(['No skills here']);
    expect(result).toEqual({});
  });

  it('should skip malformed entries gracefully', () => {
    const input = ['Skills: InvalidEntry, Shooting d6'];

    const result = getSkills(input);

    expect(result).toEqual({
      shooting: { sides: 6, modifier: 0 },
    });
  });
});
