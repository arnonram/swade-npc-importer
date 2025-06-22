import { describe, it, expect, vi, beforeEach } from 'vitest';
import { buildActorItems } from '../../src/dataBuilders/buildActorItems';

vi.mock('../../src/dataBuilders/itemBuilders', () => ({
  skillBuilder: vi.fn(async skills => [
    { name: 'Fighting', system: { attribute: 'agility' } },
  ]),
  edgeBuilder: vi.fn(async edges => [{ name: 'Brave' }]),
  hindranceBuilder: vi.fn(async hindrances => [{ name: 'Clumsy' }]),
  powerBuilder: vi.fn(async powers => [{ name: 'Bolt' }]),
}));

vi.mock('../../src/dataBuilders/buildActorItemsSpecialAbilities', () => ({
  specialAbilitiesParser: vi.fn(async abilities => [{ name: 'Aquatic' }]),
}));

vi.mock('../../src/dataBuilders/buildActorGear', () => ({
  itemGearBuilder: vi.fn(async gear => [{ name: 'Sword', type: 'weapon' }]),
}));

vi.mock('../../src/utils/foundryWrappers', () => ({
  foundryI18nLocalize: (key: string) => {
    if (key === 'npcImporter.parser.Brute') return 'Brute';
    if (key === 'npcImporter.parser.Athletics') return 'Athletics';
    return key;
  },
}));

describe('buildActorItems', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns all items from builders', async () => {
    const parsedData = {
      skills: [{ name: 'Fighting' }],
      edges: [{ name: 'Brave' }],
      hindrances: [{ name: 'Clumsy' }],
      powers: [{ name: 'Bolt' }],
      specialAbilities: [{ name: 'Aquatic' }],
      gear: { Sword: { damage: 'Str+d6' } },
    };
    const items = await buildActorItems(parsedData as any);
    expect(items).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: 'Fighting' }),
        expect.objectContaining({ name: 'Brave' }),
        expect.objectContaining({ name: 'Clumsy' }),
        expect.objectContaining({ name: 'Bolt' }),
        expect.objectContaining({ name: 'Aquatic' }),
        expect.objectContaining({ name: 'Sword', type: 'weapon' }),
      ]),
    );
  });

  it('sets Athletics attribute to strength if Brute edge is present', async () => {
    // Mock skillBuilder to return Athletics
    const itemBuilders = await import('../../src/dataBuilders/itemBuilders');
    (itemBuilders.skillBuilder as any).mockResolvedValueOnce([
      { name: 'Athletics', system: { attribute: 'agility' } },
    ]);
    (itemBuilders.edgeBuilder as any).mockResolvedValueOnce([
      { name: 'Brute' },
    ]);
    (itemBuilders.hindranceBuilder as any).mockResolvedValueOnce([]);
    (itemBuilders.powerBuilder as any).mockResolvedValueOnce([]);
    const specialAbilitiesParser = (
      await import('../../src/dataBuilders/buildActorItemsSpecialAbilities')
    ).specialAbilitiesParser;
    (specialAbilitiesParser as any).mockResolvedValueOnce([]);
    const itemGearBuilder = (
      await import('../../src/dataBuilders/buildActorGear')
    ).itemGearBuilder;
    (itemGearBuilder as any).mockResolvedValueOnce([]);

    const parsedData = {
      skills: [{ name: 'Athletics' }],
      edges: [{ name: 'Brute' }],
      hindrances: [],
      powers: [],
      specialAbilities: [],
      gear: {},
    };
    const items = await buildActorItems(parsedData as any);
    const athletics = items.find(i => i.name === 'Athletics');
    expect(athletics.system.attribute).toBe('strength');
  });
});
