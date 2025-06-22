import { describe, it, expect, vi, beforeEach } from 'vitest';
import { specialAbilitiesParser } from '../../src/dataBuilders/buildActorItemsSpecialAbilities';
import * as itemBuilder from '../../src/dataBuilders/itemBuilders';
import * as foundryActions from '../../src/utils/foundryActions';
import * as parserBuilderHelpers from '../../src/utils/parserBuilderHelpers';

// Mock all builder functions to return a recognizable value
vi.mock('../../src/dataBuilders/itemBuilder', () => ({
  abilityBuilder: vi.fn(async (name, desc) => ({
    type: 'ability',
    name,
    desc,
  })),
  armorBuilder: vi.fn(async (name, bonus, desc) => ({
    type: 'armor',
    name,
    bonus,
    desc,
  })),
  weaponBuilder: vi.fn(async props => ({ type: 'weapon', ...props })),
  itemBuilderFromSpecAbs: vi.fn(async (name, desc, type) => ({
    type,
    name,
    desc,
  })),
  ItemType: { EDGE: 'edge', HINDRANCE: 'hindrance' },
}));
vi.mock('../../src/utils/foundryActions', () => ({
  getModuleSettings: vi.fn(),
}));
vi.mock('../../src/utils/parserBuilderHelpers', () => ({
  getArmorBonus: vi.fn(() => 42),
}));
vi.mock('../../src/utils/foundryWrappers', () => ({
  foundryI18nLocalize: (x: string) => x,
}));

describe('specialAbilitiesParser', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('parses all as special abilities if settingallAsSpecialAbilities is true', async () => {
    (foundryActions.getModuleSettings as any).mockImplementation(
      (key: string) => key === 'settingallAsSpecialAbilities',
    );
    const data = { Foo: 'desc1', Bar: 'desc2' };
    const result = await specialAbilitiesParser(data);
    expect(itemBuilder.abilityBuilder).toHaveBeenCalledWith('Foo', 'desc1');
    expect(itemBuilder.abilityBuilder).toHaveBeenCalledWith('Bar', 'desc2');
    expect(result).toEqual([
      { type: 'ability', name: 'Foo', desc: 'desc1' },
      { type: 'ability', name: 'Bar', desc: 'desc2' },
    ]);
  });

  it('parses armor and weapon abilities', async () => {
    (foundryActions.getModuleSettings as any).mockImplementation(
      (key: string) => false,
    );
    const data = {
      Armor: 'desc armor',
      Sword: 'desc sword d6',
      Foo: 'desc foo',
    };
    const result = await specialAbilitiesParser(data);
    expect(itemBuilder.armorBuilder).toHaveBeenCalled();
    expect(itemBuilder.weaponBuilder).toHaveBeenCalled();
    expect(itemBuilder.abilityBuilder).toHaveBeenCalledWith('Foo', 'desc foo');
    expect(result.some(r => r.type === 'armor')).toBe(true);
    expect(result.some(r => r.type === 'weapon')).toBe(true);
    expect(result.some(r => r.type === 'ability')).toBe(true);
  });

  it('parses @w, @a, @e, @h, @sa prefixes if settingModifiedSpecialAbs is true', async () => {
    (foundryActions.getModuleSettings as any).mockImplementation(
      (key: string) => key === 'settingModifiedSpecialAbs',
    );
    const data = {
      '@wSword': 'desc sword',
      '@aArmor': 'desc armor',
      '@eEdge': 'desc edge',
      '@hHindrance': 'desc hindrance',
      '@saAbility': 'desc ability',
    };
    const result = await specialAbilitiesParser(data);
    expect(itemBuilder.weaponBuilder).toHaveBeenCalledWith({
      weaponName: 'Sword',
      weaponDescription: 'desc sword',
      weaponDamage: '',
    });
    expect(itemBuilder.armorBuilder).toHaveBeenCalledWith(
      'Armor',
      42,
      'desc armor',
    );
    expect(itemBuilder.itemBuilderFromSpecAbs).toHaveBeenCalledWith(
      'Edge',
      'desc edge',
      'edge',
    );
    expect(itemBuilder.itemBuilderFromSpecAbs).toHaveBeenCalledWith(
      'Hindrance',
      'desc hindrance',
      'hindrance',
    );
    expect(itemBuilder.abilityBuilder).toHaveBeenCalledWith(
      'Ability',
      'desc ability',
    );
    expect(result.some(r => r.type === 'weapon')).toBe(true);
    expect(result.some(r => r.type === 'armor')).toBe(true);
    expect(result.some(r => r.type === 'edge')).toBe(true);
    expect(result.some(r => r.type === 'hindrance')).toBe(true);
    expect(result.some(r => r.type === 'ability')).toBe(true);
  });
});
