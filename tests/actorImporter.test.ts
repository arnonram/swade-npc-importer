import { beforeEach, describe, expect, it, vi } from 'vitest';
import { actorImporter } from '../src/actorImporter';
import * as foundryActions from '../src/utils/foundryActions';
import * as logger from '../src/utils/logger';
import * as foundryWrappers from '../src/utils/foundryWrappers';
import { SwadeActorToImport } from '../src/types/importedActor';

describe('actorImporter', () => {
  const mockImport = vi.fn();
  const mockGetActorId = vi.fn();
  const mockDeleteActor = vi.fn();
  const mockLoggerWarn = vi.fn();
  const mockLoggerInfo = vi.fn();
  const mockLoggerError = vi.fn();
  const mockFoundryI18nLocalize = vi.fn(x => x);
  const mockFoundryUiInfo = vi.fn();

  beforeEach(() => {
    vi.spyOn(foundryActions, 'importActor').mockImplementation(mockImport);
    vi.spyOn(foundryActions, 'getActorId').mockImplementation(mockGetActorId);
    vi.spyOn(foundryActions, 'deleteActor').mockImplementation(mockDeleteActor);
    vi.spyOn(logger.Logger, 'warn').mockImplementation(mockLoggerWarn);
    vi.spyOn(logger.Logger, 'info').mockImplementation(mockLoggerInfo);
    vi.spyOn(logger.Logger, 'error').mockImplementation(mockLoggerError);
    vi.spyOn(foundryWrappers, 'foundryI18nLocalize').mockImplementation(
      mockFoundryI18nLocalize,
    );
    vi.spyOn(foundryWrappers, 'foundryUiInfo').mockImplementation(
      mockFoundryUiInfo,
    );
    global.foundry = {
      applications: {
        api: {
          DialogV2: vi.fn().mockImplementation(() => ({
            render: vi.fn(),
          })),
        },
      },
    } as any;
    mockImport.mockReset();
    mockGetActorId.mockReset();
    mockDeleteActor.mockReset();
    mockLoggerWarn.mockReset();
    mockLoggerInfo.mockReset();
    mockLoggerError.mockReset();
    mockFoundryI18nLocalize.mockReset();
    mockFoundryUiInfo.mockReset();
  });

  it('should warn and return if actor name is missing', async () => {
    await actorImporter({} as SwadeActorToImport);
    expect(mockLoggerWarn).toHaveBeenCalledWith(
      'actorImporter: Missing actor name.',
    );
    expect(mockImport).not.toHaveBeenCalled();
  });

  it('should import if actor does not exist', async () => {
    mockGetActorId.mockReturnValue(undefined);
    const actorData = { name: 'Test Actor' } as SwadeActorToImport;
    await actorImporter(actorData);
    expect(mockImport).toHaveBeenCalledWith(actorData);
  });

  it('should show dialog if actor exists', async () => {
    mockGetActorId.mockReturnValue('existing-id');
    const actorData = { name: 'Test Actor' } as SwadeActorToImport;
    await actorImporter(actorData);
    expect(global.foundry.applications.api.DialogV2).toHaveBeenCalled();
  });
});
