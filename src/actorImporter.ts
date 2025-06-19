import { Import, GetActorId, DeleteActor } from './utils/foundryActions';
import { SwadeActorToImport } from './types/importedActor';
import { Logger } from './utils/logger';

export async function actorImporter(
  actorDataToImport: SwadeActorToImport,
): Promise<void> {
  if (!actorDataToImport.name) {
    Logger.warn('actorImporter: Missing actor name.');
    return;
  }
  let actorId = GetActorId(actorDataToImport.name);
  if (!actorId) {
    await Import(actorDataToImport);
  } else {
    await whatToDo(actorDataToImport, actorId);
  }
}

async function whatToDo(
  actorData: SwadeActorToImport,
  actorId: string,
): Promise<void> {
  let actorExists = `
    ${game.i18n?.localize('npcImporter.HTML.ActorExistText')}
    <div class="form-group-dialog newName" >
        <label for="newName">${game.i18n?.localize(
          'npcImporter.HTML.ChangeName',
        )}:</label>
        <input type="text" id="newName" name="newName" value="${
          actorData.name ?? ''
        }">
    </div>
    <br/>
    `;

  new Dialog({
    title: game.i18n?.localize('npcImporter.HTML.ActorImporter') as string,
    content: actorExists,
    buttons: {
      Import: {
        label: game.i18n?.localize('npcImporter.HTML.Rename') as string,
        callback: async () => {
          let newName = (document.querySelector('#newName') as HTMLInputElement)
            .value;
          Logger.info(`Import with new name: ${newName}`);
          actorData.name = newName;
          await Import(actorData);
        },
      },
      Override: {
        label: game.i18n?.localize('npcImporter.HTML.Override') as string,
        callback: async () => {
          Logger.info('Overriding existing Actor');
          await DeleteActor(actorId);
          await Import(actorData);
        },
      },
      Cancel: {
        label: 'Cancel',
        callback: () => {
          ui.notifications?.info(
            game.i18n?.localize(
              'npcImporter.HTML.ActorNotImportedMsg',
            ) as string,
          );
        },
      },
    },
  }).render(true);
}
