import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as itemBuilders from '../../src/dataBuilders/itemBuilders';
import * as itemBuilderHelpers from '../../src/dataBuilders/itemBuilderHelpers';
import * as foundryActions from '../../src/utils/foundryActions';
import { ItemType } from '../../src/types/enums';

vi.mock('../../src/dataBuilders/itemBuilderHelpers', async () => {
  const actual = await vi.importActual<any>(
    '../../src/dataBuilders/itemBuilderHelpers',
  );
  return {
    ...actual,
    checkforItem: vi.fn(async (name, type) => ({
      name,
      type,
      img: 'img.svg',
      system: {
        description: 'desc',
        notes: 'notes',
        additionalStats: {},
        equippable: true,
        equipStatus: 3,
      },
      effects: { toJSON: () => ['fx'] },
      flags: { flag: true },
    })),
    generateDescription: vi.fn((desc, item) => desc || 'desc'),
    checkEquipedStatus: vi.fn(() => 4),
  };
});

vi.mock('../../src/utils/foundryActions', () => ({
  getItemFromCompendium: vi.fn(async (name, type) => ({ name, type })),
  getSystemCoreSkills: vi.fn(),
}));

describe('itemBuilders', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('weaponBuilder builds weapon item for a melee weapon', async () => {
    const result = await itemBuilders.weaponBuilder({
      weaponName: 'Sword',
      weaponDescription: 'desc',
      weaponDamage: 'Str+d6',
    });
    expect(result.type).toBe(ItemType.WEAPON);
    expect(result.name).toBe('Sword');
    expect(result.img).toBe('img.svg');
    expect(result.system.equippable).toBe(true);
  });

  it('weaponBuilder builds weapon item for a ranged weapon', async () => {
    const result = await itemBuilders.weaponBuilder({
      weaponName: 'Bow',
      weaponDescription: 'desc',
      weaponDamage: '2d6',
      range: '12/24/48',
      rof: '1',
      ap: '0',
      shots: '20',
    });
    expect(result.type).toBe(ItemType.WEAPON);
    expect(result.name).toBe('Bow');
    expect(result.img).toBe('img.svg');
    expect(result.system.range).toBe('12/24/48');
    expect(result.system.rof).toBe('1');
    expect(result.system.shots).toBe('20');
    expect(result.system.equippable).toBe(true);
  });

  it('gearBuilder builds gear item', async () => {
    const result = await itemBuilders.gearBuilder('Rope', 'desc');
    expect(result.type).toBe(ItemType.GEAR);
    expect(result.name).toBe('Rope');
    expect(result.img).toBe('img.svg');
    expect(result.system.equippable).toBe(false);
  });

  it('armorBuilder builds armor item', async () => {
    const result = await itemBuilders.armorBuilder('Chainmail', 2, 'desc');
    expect(result.type).toBe(ItemType.ARMOR);
    expect(result.name).toBe('Chainmail');
    expect(result.img).toBe('img.svg');
    expect(result.system.equippable).toBe(true);
    expect(result.system.armor).toBeDefined();
  });

  it('shieldBuilder builds shield item', async () => {
    const result = await itemBuilders.shieldBuilder('Shield', 'desc', 1, 2);
    expect(result.type).toBe(ItemType.SHIELD);
    expect(result.name).toBe('Shield');
    expect(result.img).toBe('img.svg');
    expect(result.system.equippable).toBe(true);
    expect(result.system.parry).toBeDefined();
    expect(result.system.cover).toBeDefined();
  });

  it('abilityBuilder builds ability item', async () => {
    const result = await itemBuilders.abilityBuilder('Aquatic', 'desc');
    expect(result.type).toBe(ItemType.ABILITY);
    expect(result.name).toBe('Aquatic');
    expect(result.img).toBe('img.svg');
    expect(result.system.subtype).toBe('special');
  });

  it('itemBuilderFromSpecAbs builds item from spec abs', async () => {
    const result = await itemBuilders.itemBuilderFromSpecAbs(
      'Spec',
      'desc',
      ItemType.EDGE,
    );
    expect(result.type).toBe(ItemType.EDGE);
    expect(result.name).toBe('Spec');
    expect(result.img).toBe('img.svg');
    expect(result.system.description).toBeDefined();
  });

  it('edgeBuilder builds edge items', async () => {
    const result = await itemBuilders.edgeBuilder(['Brave']);
    expect(result[0].type).toBe(ItemType.EDGE);
    expect(result[0].name).toBe('Brave');
  });

  it('hindranceBuilder builds hindrance items', async () => {
    const result = await itemBuilders.hindranceBuilder(['Clumsy']);
    expect(result[0].type).toBe(ItemType.HINDRANCE);
    expect(result[0].name).toBe('Clumsy');
  });

  it('powerBuilder builds power items', async () => {
    const result = await itemBuilders.powerBuilder(['Bolt']);
    expect(result[0].type).toBe(ItemType.POWER);
    expect(result[0].name).toBe('Bolt');
  });

  describe('skillBuilder', () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    it('returns empty array if skillsDict is falsy', async () => {
      const { skillBuilder } = await import(
        '../../src/dataBuilders/itemBuilders'
      );
      expect(await skillBuilder(undefined as any)).toEqual([]);
      expect(await skillBuilder(null as any)).toEqual([]);
    });

    it('builds skills with correct properties', async () => {
      const { skillBuilder } = await import(
        '../../src/dataBuilders/itemBuilders'
      );
      // Mock core skills and checkforItem
      const coreSkills = ['Fighting', 'Shooting'];
      const checkforItem = vi
        .spyOn(itemBuilderHelpers, 'checkforItem')
        .mockImplementation(async (name: string) => {
          if (name === 'Fighting')
            return {
              img: 'f.png',
              system: {
                attribute: 'agility',
                description: 'desc',
                notes: 'note',
                additionalStats: { foo: 1 },
              },
              effects: { toJSON: () => ['e1'] },
              flags: { bar: 2 },
            };
          return undefined;
        });
      vi.spyOn(foundryActions, 'getSystemCoreSkills').mockReturnValue(
        coreSkills,
      );
      const skillsDict = {
        Fighting: { sides: 6, modifier: 1 },
        Stealth: { sides: 8, modifier: 0 },
      };
      const result = await skillBuilder(skillsDict);
      expect(result).toHaveLength(2);
      const fighting = result.find((s: any) => s.name === 'Fighting');
      expect(fighting).toMatchObject({
        type: ItemType.SKILL,
        name: 'Fighting',
        img: 'f.png',
        system: expect.objectContaining({
          attribute: 'agility',
          isCoreSkill: true,
          die: { sides: 6, modifier: 1 },
          description: 'desc',
          notes: 'note',
          additionalStats: { foo: 1 },
        }),
        effects: ['e1'],
        flags: { bar: 2 },
      });
      const stealth = result.find((s: any) => s.name === 'Stealth');
      expect(stealth).toMatchObject({
        type: ItemType.SKILL,
        name: 'Stealth',
        img: 'systems/swade/assets/icons/skill.svg',
        system: expect.objectContaining({
          isCoreSkill: false,
          die: { sides: 8, modifier: 0 },
        }),
        effects: [],
        flags: {},
      });
      checkforItem.mockRestore();
    });
  });
});
