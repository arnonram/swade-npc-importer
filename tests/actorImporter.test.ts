import { beforeEach, describe, expect, it, vi } from 'vitest';
import { actorImporter } from '../src/actorImporter';
import * as foundryActions from '../src/utils/foundryActions';
import * as logger from '../src/utils/logger';
import * as foundryWrappers from '../src/utils/foundryWrappers';
import type { SwadeActorToImport } from '../src/types/importedActor';

describe('actorImporter', () => {
  const mockImport = vi.fn();
  const mockGetActorId = vi.fn();
  const mockDeleteActor = vi.fn();
  const mockLoggerWarn = vi.fn();
  const mockLoggerInfo = vi.fn();
  const mockLoggerError = vi.fn();
  const mockFoundryI18nLocalize = vi.fn(x => x);
  const mockFoundryUiInfo = vi.fn();
  const mockPrompt = vi.fn();

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
          DialogV2: Object.assign(
            vi.fn(
              class {
                render = vi.fn();
                element = { querySelector: vi.fn() };
              },
            ),
            { prompt: mockPrompt },
          ),
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
    mockPrompt.mockReset();
  });

  it('asks for a name when the actor name is missing, then imports', async () => {
    mockGetActorId.mockReturnValue(undefined);
    mockPrompt.mockResolvedValueOnce('Nameless Goblin');
    const actorData = { name: '' } as SwadeActorToImport;
    await actorImporter(actorData);
    expect(mockPrompt).toHaveBeenCalledTimes(1);
    expect(mockImport).toHaveBeenCalledWith({ name: 'Nameless Goblin' });
  });

  it('does not import when the name prompt is cancelled', async () => {
    mockPrompt.mockResolvedValueOnce(null);
    await actorImporter({} as SwadeActorToImport);
    expect(mockImport).not.toHaveBeenCalled();
    expect(mockFoundryUiInfo).toHaveBeenCalledWith(
      'npcImporter.HTML.ActorNotImportedMsg',
    );
  });

  it('asks again when an empty name is submitted', async () => {
    mockGetActorId.mockReturnValue(undefined);
    mockPrompt.mockResolvedValueOnce('   ').mockResolvedValueOnce('Grug');
    await actorImporter({} as SwadeActorToImport);
    expect(mockPrompt).toHaveBeenCalledTimes(2);
    expect(mockImport).toHaveBeenCalledWith({ name: 'Grug' });
  });

  it('checks for duplicates after a name is entered', async () => {
    mockGetActorId.mockReturnValue('existing-id');
    mockPrompt.mockResolvedValueOnce('Grug');
    await actorImporter({} as SwadeActorToImport);
    expect(mockGetActorId).toHaveBeenCalledWith('Grug');
    expect(global.foundry.applications.api.DialogV2).toHaveBeenCalled();
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

  it('prefills the rename field with names containing quotes or markup', async () => {
    mockGetActorId.mockReturnValue('existing-id');
    const name = 'Grug "The Boss" <b>';
    const input = { value: '', select: vi.fn() };
    vi.mocked(global.foundry.applications.api.DialogV2).mockImplementation(
      class {
        render = vi.fn();
        element = { querySelector: vi.fn(() => input) };
      } as any,
    );
    await actorImporter({ name } as SwadeActorToImport);

    const { content } = vi.mocked(global.foundry.applications.api.DialogV2).mock
      .calls[0][0] as { content: string };
    expect(content).not.toContain(name);
    expect(input.value).toBe(name);
    expect(input.select).toHaveBeenCalled();
  });
});
