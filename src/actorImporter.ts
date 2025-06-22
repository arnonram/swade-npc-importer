import { Import, GetActorId, DeleteActor } from './utils/foundryActions';
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

  new foundry.applications.api.DialogV2({
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
          let newName = (document.querySelector('#newName') as HTMLInputElement)
            .value;
          Logger.info(`Import with new name: ${newName}`);
          actorData.name = newName;
          await Import(actorData);
        },
      },
      {
        action: 'override',
        label: foundryI18nLocalize('npcImporter.HTML.Override'),
        callback: async () => {
          Logger.info('Overriding existing Actor');
          await DeleteActor(actorId);
          await Import(actorData);
        },
        default: true,
      },
      {
        action: 'cancel',
        label: 'Cancel',
        callback: () => {
          foundryUiInfo(
            foundryI18nLocalize('npcImporter.HTML.ActorNotImportedMsg'),
          );
        },
      },
    ],
  }).render({ force: true });
}
