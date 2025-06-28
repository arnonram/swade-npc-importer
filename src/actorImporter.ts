import { getActorId, deleteActor, importActor } from './utils/foundryActions';
import { SwadeActorToImport } from './types/importedActor';
import { Logger } from './utils/logger';
import { foundryI18nLocalize, foundryUiInfo } from './utils/foundryWrappers';

export async function actorImporter(
  actorDataToImport: SwadeActorToImport,
): Promise<void> {
  if (!actorDataToImport.name) {
    Logger.warn('actorImporter: Missing actor name.');
    return;
  }
  let actorId = getActorId(actorDataToImport.name);
  if (!actorId) {
    await safeImport(actorDataToImport);
  } else {
    await whatToDo(actorDataToImport, actorId);
  }
}

async function safeImport(actorData: SwadeActorToImport) {
  try {
    await importActor(actorData);
  } catch (error) {
    Logger.error('Failed to import actor:', error);
    foundryUiInfo(foundryI18nLocalize('npcImporter.HTML.ActorImportError'));
  }
}

async function whatToDo(
  actorData: SwadeActorToImport,
  actorId: string,
): Promise<void> {
  let actorExists = `
    ${foundryI18nLocalize('npcImporter.HTML.ActorExistText')}
    <div class="form-group-dialog newName" >
        <label for="newName">${foundryI18nLocalize(
          'npcImporter.HTML.ChangeName',
        )}:</label>
        <input type="text" id="newName" name="newName" value="${
          actorData.name ?? ''
        }">
    </div>
    <br/>
    `;

  const dialog = new foundry.applications.api.DialogV2({
    window: {
      title: foundryI18nLocalize('npcImporter.HTML.ActorImporter'),
    },
    position: {
      width: 400,
    },
    content: actorExists,
    buttons: [
      {
        action: 'import',
        label: foundryI18nLocalize('npcImporter.HTML.Rename'),
        callback: async () => {
          try {
            const newNameInput = document.querySelector(
              '#newName',
            ) as HTMLInputElement | null;
            if (!newNameInput) {
              foundryUiInfo(
                foundryI18nLocalize('npcImporter.HTML.NameInputMissing'),
              );
              return;
            }
            let newName = newNameInput.value;
            Logger.info(`Import with new name: ${newName}`);
            actorData.name = newName;
            await safeImport(actorData);
          } catch (error) {
            Logger.error('Rename import failed:', error);
            foundryUiInfo(
              foundryI18nLocalize('npcImporter.HTML.ActorImportError'),
            );
          }
        },
      },
      {
        action: 'override',
        label: foundryI18nLocalize('npcImporter.HTML.Override'),
        callback: async () => {
          try {
            Logger.info('Overriding existing Actor');
            await deleteActor(actorId);
            await safeImport(actorData);
          } catch (error) {
            Logger.error('Override import failed:', error);
            foundryUiInfo(
              foundryI18nLocalize('npcImporter.HTML.ActorImportError'),
            );
          }
        },
        default: true,
      },
      {
        action: 'cancel',
        label: foundryI18nLocalize('npcImporter.HTML.Cancel'),
        callback: () => {
          foundryUiInfo(
            foundryI18nLocalize('npcImporter.HTML.ActorNotImportedMsg'),
          );
        },
      },
    ],
  });

  dialog.render({ force: true });

  // Focus the input field when the dialog is rendered
  setTimeout(() => {
    const newNameInput = document.querySelector(
      '#newName',
    ) as HTMLInputElement | null;
    if (newNameInput) {
      newNameInput.focus();
      newNameInput.select();
    }
  }, 100);
}
