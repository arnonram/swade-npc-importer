import { beforeEach, describe, expect, it, vi } from 'vitest';

import { buildActor } from '../src/actorBuilder';
import * as foundryActions from '../src/utils/foundryActions';
import * as logger from '../src/utils/logger';
import * as foundryWrappers from '../src/utils/foundryWrappers';

let statBlockParserMock = vi.fn();
let actorImporterMock = vi.fn();
vi.mock('../src/statBlockParser/parseStatBlock', () => ({
  statBlockParser: (...args: any[]) => statBlockParserMock(...args),
}));
vi.mock('../src/actorImporter', () => ({
  actorImporter: (...args: any[]) => actorImporterMock(...args),
}));
vi.mock('../src/dataBuilders/buildActorData', () => ({
  buildActorData: vi.fn().mockResolvedValue({}),
}));
vi.mock('../src/dataBuilders/buildActorItems', () => ({
  buildActorItems: vi.fn().mockResolvedValue([]),
}));
vi.mock('../src/dataBuilders/buildActorToken', () => ({
  buildActorToken: vi.fn().mockResolvedValue({}),
}));

describe('buildActor', () => {
  const mockSetAllPacks = vi.fn();
  const mockSetParsingLanguage = vi.fn();
  const mockGetModuleSettings = vi.fn();
  const mockUpdateModuleSetting = vi.fn();
  const mockResetAllPacks = vi.fn();
  const mockLoggerError = vi.fn();
  const mockLoggerInfo = vi.fn();
  const mockFoundryI18nLocalize = vi.fn(x => x);
  const mockFoundryUiError = vi.fn();

  beforeEach(() => {
    vi.spyOn(foundryActions, 'setAllPacks').mockImplementation(mockSetAllPacks);
    vi.spyOn(foundryActions, 'setParsingLanguage').mockImplementation(
      mockSetParsingLanguage,
    );
    vi.spyOn(foundryActions, 'getModuleSettings').mockImplementation(
      mockGetModuleSettings,
    );
    vi.spyOn(foundryActions, 'updateModuleSetting').mockImplementation(
      mockUpdateModuleSetting,
    );
    vi.spyOn(foundryActions, 'resetAllPacks').mockImplementation(
      mockResetAllPacks,
    );
    vi.spyOn(logger.Logger, 'error').mockImplementation(mockLoggerError);
    vi.spyOn(logger.Logger, 'info').mockImplementation(mockLoggerInfo);
    vi.spyOn(foundryWrappers, 'foundryI18nLocalize').mockImplementation(
      mockFoundryI18nLocalize,
    );
    vi.spyOn(foundryWrappers, 'foundryUiError').mockImplementation(
      mockFoundryUiError,
    );
    global.game = { i18n: { lang: 'en' } } as any;
    statBlockParserMock = vi.fn(); // Reset the mock for each test
    actorImporterMock = vi.fn(); // Reset the mock for each test
    mockSetAllPacks.mockReset();
    mockSetParsingLanguage.mockReset();
    mockGetModuleSettings.mockReset();
    mockUpdateModuleSetting.mockReset();
    mockResetAllPacks.mockReset();
    mockLoggerError.mockReset();
    mockLoggerInfo.mockReset();
    mockFoundryI18nLocalize.mockReset();
    mockFoundryUiError.mockReset();
  });

  vi.mock('../src/utils/foundryActions', async () => {
    const actual = await vi.importActual<any>('../src/utils/foundryActions');
    return {
      ...actual,
      getFolderId: vi.fn().mockReturnValue('folderId'),
      getImporterModuleData: vi.fn().mockReturnValue({}),
    };
  });

  it('should show error if statblock is empty and clipboard fails', async () => {
    vi.stubGlobal('navigator', {
      clipboard: { readText: vi.fn().mockRejectedValue(new Error('denied')) },
    });
    await buildActor({ saveFolder: 'folder' } as any, '');
    expect(mockLoggerError).toHaveBeenCalledWith(
      'Clipboard read failed:',
      expect.any(Error),
    );
    expect(mockFoundryUiError).toHaveBeenCalledWith(
      'npcImporter.parser.ClipboardPermissionError',
    );
  });

  it('should show error if statblock is empty after clipboard', async () => {
    vi.stubGlobal('navigator', {
      clipboard: { readText: vi.fn().mockResolvedValue('') },
    });
    await buildActor({ saveFolder: 'folder' } as any, '');
    expect(mockFoundryUiError).toHaveBeenCalledWith(
      'npcImporter.parser.EmptyClipboard',
    );
  });

  it('should parse and import actor if statblock is provided', async () => {
    statBlockParserMock.mockResolvedValue({
      name: 'Test',
      items: [],
      system: {},
    });
    vi.stubGlobal('navigator', { clipboard: { readText: vi.fn() } });
    await buildActor(
      {
        saveFolder: 'folder',
        actorType: 'npc',
        isWildCard: false,
        tokenSettings: {},
      } as any,
      'statblock',
    );
    expect(statBlockParserMock).toHaveBeenCalledWith('statblock');
    expect(actorImporterMock).toHaveBeenCalled();
  });

  it('should show localized error if parsing fails', async () => {
    statBlockParserMock.mockRejectedValue(new Error('parse fail'));
    vi.stubGlobal('navigator', { clipboard: { readText: vi.fn() } });
    await buildActor({ saveFolder: 'folder' } as any, 'statblock');
    expect(mockLoggerError).toHaveBeenCalledWith(
      'Failed to build finalActor: ',
      expect.any(Error),
    );
    expect(mockFoundryUiError).toHaveBeenCalledWith(
      'npcImporter.parser.BuildActorError: parse fail',
    );
  });
});
