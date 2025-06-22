import { describe, it, expect, vi, beforeEach } from 'vitest';
import { buildActorToken } from '../../src/dataBuilders/buildActorToken';
import { ParsedActor, TokenSettings } from '../../src/types/importedActor';
import { getModuleSettings } from '../../src/utils/foundryActions';

// Mocks
vi.mock('../../src/utils/foundryActions', () => ({
  getModuleSettings: vi.fn(),
}));

vi.mock('../../src/global.js', () => ({
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
});
