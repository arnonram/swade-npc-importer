import { describe, it, expect, vi, beforeEach } from 'vitest';
import { specialAbilitiesParser } from '../../src/dataBuilders/buildActorItemsSpecialAbilities';
import { ItemType } from '../../src/types/enums';
import {
  settingallAsSpecialAbilities,
  settingModifiedSpecialAbs,
} from '../../src/global';

vi.mock('../../src/dataBuilders/itemBuilders', async () => {
  const actual = await vi.importActual<any>(
    '../../src/dataBuilders/itemBuilders',
  );
  return {
    ...actual,
    abilityBuilder: vi.fn(async (name, desc) => ({
      type: ItemType.ABILITY,
      name,
      desc,
    })),
    armorBuilder: vi.fn(async (name, bonus, desc) => ({
      type: ItemType.ARMOR,
      name,
      bonus,
      desc,
    })),
    weaponBuilder: vi.fn(async props => ({ type: ItemType.WEAPON, ...props })),
    itemBuilderFromSpecAbs: vi.fn(async (name, desc, type) => ({
      type,
      name,
      desc,
    })),
  };
});

vi.mock('../../src/utils/foundryActions', () => ({
  getModuleSettings: vi.fn(key => false),
}));

vi.mock('../../src/statBlockParser/parserBuilderHelpers', () => ({
  getArmorBonus: (name: string) => 2,
}));

describe('specialAbilitiesParser', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('parses all as special abilities if settingallAsSpecialAbilities is true', async () => {
    const { getModuleSettings } = await import(
      '../../src/utils/foundryActions'
    );
    (getModuleSettings as any).mockImplementation(
      key => key === settingallAsSpecialAbilities,
    );
    const data = { Aquatic: 'Can swim', Brave: 'Fearless' };
    const result = await specialAbilitiesParser(data);
    expect(result).toEqual([
      { type: ItemType.ABILITY, name: 'Aquatic', desc: 'Can swim' },
      { type: ItemType.ABILITY, name: 'Brave', desc: 'Fearless' },
    ]);
  });

  it('parses ability as default', async () => {
    const data = { Aquatic: 'Can swim' };
    const result = await specialAbilitiesParser(data);
    expect(result[0].type).toBe(ItemType.ABILITY);
    expect(result[0].name).toBe('Aquatic');
  });

  it('parses prefixed @w, @a, @e, @h, @sa', async () => {
    const { getModuleSettings } = await import(
      '../../src/utils/foundryActions'
    );
    (getModuleSettings as any).mockImplementation(
      key => key === settingModifiedSpecialAbs,
    );
    const data = {
      '@w Sword': 'Str+d6',
      '@a Armor': '+2 Armor',
      '@e Brave': 'Edge desc',
      '@h Clumsy': 'Hindrance desc',
      '@sa Aquatic': 'Can swim',
    };
    const result = await specialAbilitiesParser(data);
    expect(result[0].type).toBe(ItemType.WEAPON);
    expect(result[1].type).toBe(ItemType.ARMOR);
    expect(result[2].type).toBe(ItemType.EDGE);
    expect(result[3].type).toBe(ItemType.HINDRANCE);
    expect(result[4].type).toBe(ItemType.ABILITY);
  });

  it('parses default (not all as special, not modified) as ability, armor, or weapon', async () => {
    const { getModuleSettings } = await import(
      '../../src/utils/foundryActions'
    );
    (getModuleSettings as any).mockImplementation(() => false);
    const data = {
      Armor: '+2 Toughness',
      Sword: 'Str+d6',
      Aquatic: 'Can swim',
    };
    const result = await specialAbilitiesParser(data);
    expect(result[0].type).toBe(ItemType.ARMOR);
    expect(result[1].type).toBe(ItemType.WEAPON);
    expect(result[2].type).toBe(ItemType.ABILITY);
  });

  it('parses all as special abilities if only settingallAsSpecialAbilities is true', async () => {
    const { getModuleSettings } = await import(
      '../../src/utils/foundryActions'
    );
    (getModuleSettings as any).mockImplementation(
      key => key === settingallAsSpecialAbilities,
    );
    const data = {
      Armor: '+2 Toughness',
      Sword: 'Str+d6',
      Aquatic: 'Can swim',
    };
    const result = await specialAbilitiesParser(data);
    expect(result.every(i => i.type === ItemType.ABILITY)).toBe(true);
  });

  it('parses prefixed only if settingModifiedSpecialAbs is true', async () => {
    const { getModuleSettings } = await import(
      '../../src/utils/foundryActions'
    );
    (getModuleSettings as any).mockImplementation(
      key => key === settingModifiedSpecialAbs,
    );
    const data = {
      '@w Sword': 'Str+d6',
      '@a Armor': '+2 Toughness',
      '@e Brave': 'Edge desc',
      '@h Clumsy': 'Hindrance desc',
      '@sa Aquatic': 'Can swim',
      Aquatic: 'Can swim', // should be ignored
    };
    const result = await specialAbilitiesParser(data);
    expect(result[0].type).toBe(ItemType.WEAPON);
    expect(result[1].type).toBe(ItemType.ARMOR);
    expect(result[2].type).toBe(ItemType.EDGE);
    expect(result[3].type).toBe(ItemType.HINDRANCE);
    expect(result[4].type).toBe(ItemType.ABILITY);
    // The non-prefixed 'Aquatic' should be ignored (returns null, filtered out)
    expect(result.length).toBe(5);
  });

  it('returns empty array for undefined or empty input', async () => {
    expect(await specialAbilitiesParser(undefined)).toEqual([]);
    expect(await specialAbilitiesParser({})).toEqual([]);
  });

  it('ignores unknown prefix when settingModifiedSpecialAbs is true', async () => {
    const { getModuleSettings } = await import(
      '../../src/utils/foundryActions'
    );
    (getModuleSettings as any).mockImplementation(
      key => key === settingModifiedSpecialAbs,
    );
    const data = {
      '@x Unknown': 'Some desc',
      '@w Sword': 'Str+d6',
    };
    const result = await specialAbilitiesParser(data);
    expect(result.length).toBe(1);
    expect(result[0].type).toBe(ItemType.WEAPON);
  });

  it('does not parse Speed as weapon even if value matches weapon regex', async () => {
    const { getModuleSettings } = await import(
      '../../src/utils/foundryActions'
    );
    (getModuleSettings as any).mockImplementation(() => false);
    const data = { Speed: 'Str+d6' };
    const result = await specialAbilitiesParser(data);
    expect(result[0].type).toBe(ItemType.ABILITY);
    expect(result[0].name).toBe('speed');
  });
});
