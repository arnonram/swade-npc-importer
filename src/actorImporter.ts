import { getActorId, deleteActor, importActor } from './utils/foundryActions';
import type { SwadeActorToImport } from './types/importedActor';
import { Logger } from './utils/logger';
import { foundryI18nLocalize, foundryUiInfo } from './utils/foundryWrappers';

export async function actorImporter(
  actorDataToImport: SwadeActorToImport,
): Promise<void> {
  if (!actorDataToImport.name?.trim()) {
    const name = await askForName();
    if (name === null) {
      foundryUiInfo(
        foundryI18nLocalize('npcImporter.HTML.ActorNotImportedMsg'),
      );
      return;
    }
    // Re-run so an empty submission asks again and a duplicate name is caught.
    await actorImporter({ ...actorDataToImport, name });
    return;
  }
  const actorId = getActorId(actorDataToImport.name);
  if (!actorId) {
    await safeImport(actorDataToImport);
  } else {
    await whatToDo(actorDataToImport, actorId);
  }
}

/**
 * Asks for a name when the stat block has none.
 * Resolves to the entered name, or null if the dialog was cancelled or closed.
 */
async function askForName(): Promise<string | null> {
  return foundry.applications.api.DialogV2.prompt({
    window: {
      title: foundryI18nLocalize('npcImporter.HTML.ActorImporter'),
    },
    position: {
      width: 400,
    },
    content: `
    <div class="form-group stacked">
        <label for="actorName">${foundryI18nLocalize(
          'npcImporter.HTML.EnterName',
        )}</label>
        <input type="text" id="actorName" name="actorName" autofocus>
    </div>
    `,
    ok: {
      label: foundryI18nLocalize('npcImporter.HTML.Import'),
      callback: (_event: Event, button: HTMLButtonElement) =>
        (
          button.form?.elements.namedItem(
            'actorName',
          ) as HTMLInputElement | null
        )?.value.trim() ?? '',
    },
    rejectClose: false,
  });
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
  const actorExists = `
    ${foundryI18nLocalize('npcImporter.HTML.ActorExistText')}
    <div class="form-group-dialog newName" >
        <label for="newName">${foundryI18nLocalize(
          'npcImporter.HTML.ChangeName',
        )}:</label>
        <input type="text" id="newName" name="newName" autofocus>
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
        callback: async (_event: Event, button: HTMLButtonElement) => {
          try {
            const newNameInput = button.form?.elements.namedItem(
              'newName',
            ) as HTMLInputElement | null;
            if (!newNameInput) {
              foundryUiInfo(
                foundryI18nLocalize('npcImporter.HTML.NameInputMissing'),
              );
              return;
            }
            const newName = newNameInput.value;
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

  await dialog.render({ force: true });
  // Set via DOM, not markup, so names with quotes or HTML stay intact.
  const newNameInput =
    dialog.element.querySelector<HTMLInputElement>('#newName');
  if (newNameInput) {
    newNameInput.value = actorData.name ?? '';
    newNameInput.select();
  }
}
