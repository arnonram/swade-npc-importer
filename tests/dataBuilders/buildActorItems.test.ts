import { describe, it, expect, vi, beforeEach } from 'vitest';
import { buildActorItems } from '../../src/dataBuilders/buildActorItems';
import { ParsedActor } from '../../src/types/importedActor';
import * as itemBuilder from '../../src/dataBuilders/itemBuilders';
import { specialAbilitiesParser } from '../../src/dataBuilders/buildActorItemsSpecialAbilities';
import { itemGearBuilder } from '../../src/dataBuilders/buildActorGear';

// Mock all builder functions
vi.mock('../../src/dataBuilders/itemBuilder', () => ({
  skillBuilder: vi.fn(),
  edgeBuilder: vi.fn(),
  hindranceBuilder: vi.fn(),
  powerBuilder: vi.fn(),
}));

vi.mock('../../src/dataBuilders/buildActorItemsSpecialAbilities', () => ({
  specialAbilitiesParser: vi.fn(),
}));

vi.mock('../../src/dataBuilders/buildActorGear', () => ({
  itemGearBuilder: vi.fn(),
}));

vi.mock('.../../src/utils/foundryWrappers', () => ({
  foundryI18nLocalize: vi.fn((key: string) => {
    const map: Record<string, string> = {
      'npcImporter.parser.Brute': 'Brute',
      'npcImporter.parser.Athletics': 'Athletics',
    };
    return map[key] ?? key;
  }),
}));

describe('buildActorItems', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('builds and combines all item types', async () => {
    (itemBuilder.skillBuilder as any).mockResolvedValue([{ name: 'Skill A' }]);
    (itemBuilder.edgeBuilder as any).mockResolvedValue([{ name: 'Edge A' }]);
    (itemBuilder.hindranceBuilder as any).mockResolvedValue([
      { name: 'Hindrance A' },
    ]);
    (itemBuilder.powerBuilder as any).mockResolvedValue([{ name: 'Power A' }]);
    (specialAbilitiesParser as any).mockResolvedValue([{ name: 'Special A' }]);
    (itemGearBuilder as any).mockResolvedValue([{ name: 'Gear A' }]);

    const parsedData: ParsedActor = {
      skills: {},
      edges: [],
      hindrances: [],
      powers: [],
      specialAbilities: {},
      gear: [],
      name: '',
      attributes: {} as any,
    };

    const result = await buildActorItems(parsedData);

    expect(result).toEqual([
      { name: 'Skill A' },
      { name: 'Edge A' },
      { name: 'Hindrance A' },
      { name: 'Power A' },
      { name: 'Special A' },
      { name: 'Gear A' },
    ]);
  });

  it('applies Brute logic to set Athletics attribute to strength', async () => {
    (itemBuilder.skillBuilder as any).mockResolvedValue([
      { name: 'Athletics', system: { attribute: 'agility' } },
    ]);
    (itemBuilder.edgeBuilder as any).mockResolvedValue([{ name: 'Brute' }]);
    (itemBuilder.hindranceBuilder as any).mockResolvedValue([]);
    (itemBuilder.powerBuilder as any).mockResolvedValue([]);
    (specialAbilitiesParser as any).mockResolvedValue([]);
    (itemGearBuilder as any).mockResolvedValue([]);

    const parsedData: ParsedActor = {
      skills: {},
      edges: [],
      hindrances: [],
      powers: [],
      specialAbilities: {},
      gear: [],
      name: '',
      attributes: {} as any,
    };

    const result = await buildActorItems(parsedData);
    const athletics = result.find(i => i.name === 'Athletics');

    expect(athletics?.system.attribute).toBe('strength');
  });

  it('does not alter Athletics if Brute is missing', async () => {
    (itemBuilder.skillBuilder as any).mockResolvedValue([
      { name: 'Athletics', system: { attribute: 'agility' } },
    ]);
    (itemBuilder.edgeBuilder as any).mockResolvedValue([]); // Brute missing
    (itemBuilder.hindranceBuilder as any).mockResolvedValue([]);
    (itemBuilder.powerBuilder as any).mockResolvedValue([]);
    (specialAbilitiesParser as any).mockResolvedValue([]);
    (itemGearBuilder as any).mockResolvedValue([]);

    const parsedData: ParsedActor = {
      skills: {},
      edges: [],
      hindrances: [],
      powers: [],
      specialAbilities: {},
      gear: [],
      name: '',
      attributes: {} as any,
    };

    const result = await buildActorItems(parsedData);
    const athletics = result.find(i => i.name === 'Athletics');

    expect(athletics?.system.attribute).toBe('agility');
  });
});
