import { buildActor } from './actorBuilder';
import {
  settingDefaultActorType,
  settingDefaultIsWildcard,
  settingLastSaveFolder,
  settingActiveCompendiums,
  settingToken,
} from './global.js';
import { NpcImporterSettings } from './settings/npcImporterSettings';
import { ImportSettings } from './types/importedActor';
import {
  getModuleSettings,
  getAllActorFolders,
  updateModuleSetting,
  getAllActiveCompendiums,
} from './utils/foundryActions';
import { Logger } from './utils/logger';

Hooks.on('ready', async () => {
  if (
    game.userId &&
    game.users?.get(game.userId)?.can('ACTOR_CREATE') == true
  ) {
    Logger.info('Setting up settings...');
    await NpcImporterSettings.register();
    // update Active Compendiums for Importer to use
    await updateModuleSetting(
      settingActiveCompendiums,
      getAllActiveCompendiums(),
    );
  }
});

Hooks.on('renderActorDirectory', async (app: any, html: any, data: any) => {
  if (
    game.userId &&
    game.users?.get(game.userId)?.can('ACTOR_CREATE') == true
  ) {
    const npcImporterButton = $(
      `<button id="StatBlockImporterButton" style="width: calc(100% - 8px);"><i class="fas fa-align-left"></i>${game.i18n?.localize(
        'npcImporter.HTML.StatBlockImporterTitle',
      )}</button>`,
    );

    $(html).find('.directory-footer').append(npcImporterButton);

    npcImporterButton.on('click', () => {
      new foundry.applications.api.DialogV2({
        window: {
          title: game.i18n?.localize('npcImporter.HTML.ImportTitle') as string,
          resizable: true,
        },
        content: importerDialogue(),
        buttons: [
          {
            action: 'importActor',
            label: game.i18n?.localize('npcImporter.HTML.Import') as string,
            default: true,
            callback: (html: any) => {
              let radios = document.querySelectorAll(
                'input[type="radio"]:checked',
              );
              let importSettings: ImportSettings = {
                actorType: (radios[0] as HTMLInputElement).value,
                isWildCard: (radios[1] as HTMLInputElement).value,
                tokenSettings: {
                  disposition: parseInt((radios[2] as HTMLInputElement).value),
                  vision: (
                    document.getElementsByName('vision')[0] as HTMLInputElement
                  ).checked,
                  visionRange:
                    parseInt(
                      (
                        document.getElementsByName(
                          'visionRange',
                        )[0] as HTMLInputElement
                      ).value,
                    ) || 0,
                  visionAngle: parseInt(
                    (
                      document.getElementsByName(
                        'visionAngle',
                      )[0] as HTMLInputElement
                    ).value || '360',
                  ),
                },
                saveFolder: (
                  document.getElementsByName(
                    'save-folder',
                  )[0] as HTMLSelectElement
                ).value,
              };
              buildActor(
                importSettings,
                (document.getElementById('statBlock') as HTMLTextAreaElement)
                  .value,
              );
            },
          },
          {
            action: 'cancel',
            label: 'Cancel',
          },
        ],
      }).render(true);
    });
  }
});

function importerDialogue(): string {
  const defaultData = {
    actorType: getModuleSettings(settingDefaultActorType),
    isWildcard: getModuleSettings(settingDefaultIsWildcard),
    tokenData: getModuleSettings(settingToken),
  };
  const folderOptions = buildFolderOptions();

  const npcImporterDialog = `
        <head>
            <style>
                * {
                box-sizing: border-box;
                }
                .column {
                    float: left;
                    width: 33.33%;
                    padding: 3px;
                    height: 100px;
                }
                .row:after {
                    content: "";
                    display: table;
                    clear: both;
                }
            </style>
        </head>
        <form>
        <p>${game.i18n?.localize('npcImporter.HTML.ImportDesc')}</p>
        <div class = "row">
            <div class="column">
                <p>${game.i18n?.localize('npcImporter.HTML.ActorType')}:</p>
                <input type="radio" id="npc" name="actorType" value="npc" ${isChecked(
                  defaultData.actorType,
                  'npc',
                )}>
                <label for="NPC">${game.i18n?.localize(
                  'npcImporter.settings.NPC',
                )}</label><br>
                <input type="radio" id="character" name="actorType" value="character" ${isChecked(
                  defaultData.actorType,
                  'character',
                )}>
                <label for="character">${game.i18n?.localize(
                  'npcImporter.settings.Character',
                )}</label>
            </div>
            <div class="column">
                <p>${game.i18n?.localize('npcImporter.HTML.Wildcard')}?</p>
                <input type="radio" id="yes" name="isWildcard" value="true" ${isChecked(
                  defaultData.isWildcard,
                  true,
                )}>
                <label for="yes">${game.i18n?.localize(
                  'npcImporter.HTML.Yes',
                )}</label><br>
                <input type="radio" id="no" name="isWildcard" value="false" ${isChecked(
                  defaultData.isWildcard,
                  false,
                )}>
                <label for="no">${game.i18n?.localize(
                  'npcImporter.HTML.No',
                )}</label>
            </div>
            <div class="column">
                <p>${game.i18n?.localize('npcImporter.HTML.Disposition')}:</p>
                <input type="radio" id="hostile" name="disposition" value="-1" ${isChecked(
                  defaultData.tokenData.disposition,
                  -1,
                )}>
                <label for="hostile">${game.i18n?.localize(
                  'npcImporter.settings.Hostile',
                )}</label><br>
                <input type="radio" id="neutral" name="disposition" value="0" ${isChecked(
                  defaultData.tokenData.disposition,
                  0,
                )}>
                <label for="neutral">${game.i18n?.localize(
                  'npcImporter.settings.Neutral',
                )}</label><br>
                <input type="radio" id="friendly" name="disposition" value="1" ${isChecked(
                  defaultData.tokenData.disposition,
                  1,
                )}>
                <label for="friendly">${game.i18n?.localize(
                  'npcImporter.settings.Friendly',
                )}</label><br>
                <input type="radio" id="secret" name="disposition" value="-2" ${isChecked(
                  defaultData.tokenData.disposition,
                  1,
                )}>
                <label for="secret">${game.i18n?.localize(
                  'npcImporter.settings.Secret',
                )}</label>
            </div>
        </div>
        <div class="form-group slim">
          <p>${game.i18n?.localize('TOKEN.FIELDS.sight.enabled.label')}</p>
          <input type="checkbox" id="vision" name="vision" value="vision" ${
            defaultData.tokenData.vision == true ? 'checked' : ''
          }/>
        </div>
        <div class="form-group slim">
          <p>${game.i18n?.localize('TOKEN.FIELDS.sight.range.label')}</p>
          <input type="number" step="1" name="visionRange" value="${
            defaultData.tokenData.visionRange
          }" />
        </div>
        <div class="form-group slim">
          <p>${game.i18n?.localize('TOKEN.FIELDS.sight.angle.label')}</p>
            <input type="number" name="visionAngle" step="1" max="360" value="${
              defaultData.tokenData.visionAngle
            }" />
          </div>
        <div class="form-group slim">
          <label>${game.i18n?.localize(
            'npcImporter.HTML.SaveFolder',
          )} </label>          
          <select name="save-folder" style="width: 50%">${folderOptions}</select>
        </div>
        <div class = "row">
            <label for="statBlock"><b>${game.i18n?.localize(
              'npcImporter.HTML.StatBlock',
            )}</b></label>
            <textarea id="statBlock" name="statBlock" rows="10" autocomplete="off" placeholder="${game.i18n?.localize(
              'npcImporter.HTML.Firefox',
            )}"></textarea>
        </div>
        </br>
        </form>
        `;
  return npcImporterDialog;
}

function isChecked(setValue: any, html_value: any): string {
  if (setValue == html_value) {
    return 'checked';
  } else {
    return '';
  }
}

function buildFolderOptions(): string {
  let lastSave = getModuleSettings(settingLastSaveFolder);
  let folders = getAllActorFolders();
  let folderOptions = `<option value='' ${isLastSavedFolder(
    lastSave,
    '',
  )}>--</option>`;
  folders.forEach(folder => {
    folderOptions += `<option value="${folder.trim()}" ${isLastSavedFolder(
      lastSave,
      folder.trim(),
    )}>${folder.trim()}</option>`;
  });
  return folderOptions;
}

function isLastSavedFolder(lastFolder: any, folderName: any): string {
  if (lastFolder != undefined && lastFolder === folderName) {
    return 'selected';
  } else {
    return '';
  }
}
