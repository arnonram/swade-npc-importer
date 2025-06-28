import { describe, it, expect, vi, beforeEach } from 'vitest';
import { buildActorToken } from '../../src/dataBuilders/buildActorToken';
import { ParsedActor, TokenSettings } from '../../src/types/importedActor';
import { getModuleSettings } from '../../src/utils/foundryActions';

// Mocks
vi.mock('../../src/utils/foundryActions', () => ({
  getModuleSettings: vi.fn(),
}));

vi.mock('../../src/global', () => ({
  settingAutoCalcSize: 'npcImporter.autoSize',
  settingToken: 'npcImporter.tokenSettings',
}));

describe('buildActorToken', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const tokenSettings: TokenSettings = {
    disposition: 1,
    vision: true,
    visionRange: 30,
    visionAngle: 180,
  };

  const baseParsed: ParsedActor = {
    size: 3,
    name: '',
    attributes: {} as any,
  };

  it('creates token with displayName and disposition', async () => {
    (getModuleSettings as any).mockImplementation(key => {
      if (key === 'npcImporter.tokenSettings') return { displayName: '50' };
      if (key === 'npcImporter.autoSize') return false;
    });

    const token = await buildActorToken(baseParsed, tokenSettings);

    expect(token.displayName).toBe(50);
    expect(token.disposition).toBe(1);
    expect(token.sight).toEqual({
      enabled: true,
      range: 30,
      angle: 180,
    });
    expect(token.width).toBeUndefined(); // because auto-size is off
  });

  it('auto-calculates width, height, and scale if enabled', async () => {
    (getModuleSettings as any).mockImplementation(key => {
      if (key === 'npcImporter.tokenSettings') return { displayName: '20' };
      if (key === 'npcImporter.autoSize') return true;
    });

    const token = await buildActorToken(baseParsed, tokenSettings);

    expect(token.width).toBe(2);
    expect(token.height).toBe(2);
    expect(token.scale).toBe(1);
  });

  it('scales correctly for negative size values', async () => {
    const parsedTiny: ParsedActor = {
      size: -3,
      name: '',
      attributes: {} as any,
    };

    (getModuleSettings as any).mockImplementation(key => {
      if (key === 'npcImporter.tokenSettings') return { displayName: '10' };
      if (key === 'npcImporter.autoSize') return true;
    });

    const token = await buildActorToken(parsedTiny, tokenSettings);

    expect(token.width).toBe(1);
    expect(token.height).toBe(1);
    expect(token.scale).toBe(0.75);
  });

  const testCases = [
    // [size, expectedWidth, expectedHeight, expectedScale]
    { size: -5, width: 1, height: 1, scale: 0.5 },
    { size: -4, width: 1, height: 1, scale: 0.5 },
    { size: -3, width: 1, height: 1, scale: 0.75 },
    { size: -2, width: 1, height: 1, scale: 0.75 },
    { size: -1, width: 1, height: 1, scale: 0.85 },
    { size: 0, width: 1, height: 1, scale: 1 },
    { size: 2, width: 1, height: 1, scale: 1 },
    { size: 3, width: 2, height: 2, scale: 1 },
    { size: 5, width: 2, height: 2, scale: 1 },
    { size: 6, width: 4, height: 4, scale: 1 },
    { size: 8, width: 4, height: 4, scale: 1 },
    { size: 9, width: 8, height: 8, scale: 1 },
    { size: 11, width: 8, height: 8, scale: 1 },
    { size: 12, width: 16, height: 16, scale: 1 },
    { size: 20, width: 16, height: 16, scale: 1 },
  ];

  for (const { size, width, height, scale } of testCases) {
    it(`returns width=${width}, height=${height}, scale=${scale} for size=${size} (auto-size on)`, async () => {
      (getModuleSettings as any).mockImplementation(key => {
        if (key === 'npcImporter.tokenSettings') return { displayName: '1' };
        if (key === 'npcImporter.autoSize') return true;
      });
      const parsed: ParsedActor = { size, name: '', attributes: {} as any };
      const token = await buildActorToken(parsed, tokenSettings);
      expect(token.width).toBe(width);
      expect(token.height).toBe(height);
      expect(token.scale).toBe(scale);
    });
  }
});
