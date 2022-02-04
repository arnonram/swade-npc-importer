import { buildActor } from './actorBuilder.js';
import {
  log,
  settingDefaultActorType,
  settingDefaultDisposition,
  settingDefaultIsWildcard,
  settingLastSaveFolder,
  settingActiveCompendiums,
  settingToken,
} from './global.js';
import { NpcImporterSettings } from './settings/npcImporterSettings.js';
import {
  getModuleSettings,
  getAllActorFolders,
  updateModuleSetting,
  getAllActiveCompendiums,
} from './utils/foundryActions.js';

Hooks.on('ready', async () => {
  if (game.users.get(game.userId).can('ACTOR_CREATE') == true) {
    log('Setting up settings...');
    await NpcImporterSettings.register();
    // update Active Compendiums for Importer to use
    await updateModuleSetting(
      settingActiveCompendiums,
      getAllActiveCompendiums()
    );
  }
});

Hooks.on('renderActorDirectory', async (app, html, data) => {
  if (game.users.get(game.userId).can('ACTOR_CREATE') == true) {
    const npcImporterButton = $(
      `<button style="margin: 4px; padding: 1px 6px;"><i class="fas fa-file-import"> ${game.i18n.localize(
        'npcImporter.HTML.ActorImporter'
      )}</i></button>`
    );
    html.find('.directory-footer').append(npcImporterButton);

    npcImporterButton.click(() => {
      new Dialog({
        title: game.i18n.localize('npcImporter.HTML.ImportTitle'),
        content: importerDialogue(),
        buttons: {
          Import: {
            label: game.i18n.localize('npcImporter.HTML.Import'),
            callback: html => {
              let radios = document.querySelectorAll(
                'input[type="radio"]:checked'
              );
              let importSettings = {
                actorType: radios[0].value,
                isWildCard: radios[1].value,
                tokenSettings: {
                  disposition: parseInt(radios[2].value),
                  vision: document.getElementsByName('vision')[0].checked,
                  dimSight:
                    parseInt(document.getElementsByName('dimSight')[0].value) ||
                    0,
                  brightSight:
                    parseInt(
                      document.getElementsByName('brightSight')[0].value
                    ) || 0,
                  sightAngle: parseInt(
                    document.getElementsByName('sightAngle')[0].value || 360
                  ),
                },
                saveFolder: html.find('select[name="save-folder"]')[0].value,
              };
              buildActor(
                importSettings,
                document.getElementById('statBlock').value
              );
            },
          },
          Cancel: {
            label: 'Cancel',
          },
        },
        Default: 'Import!',
      }).render(true);
    });
  }
});

function importerDialogue() {
  let defaultData = {
    actorType: getModuleSettings(settingDefaultActorType),
    isWildcard: getModuleSettings(settingDefaultIsWildcard),
    tokenData: getModuleSettings(settingToken),
  };

  let folderOptions = buildFolderOptions();

  let npcImporterDialog = `
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
        <p>${game.i18n.localize('npcImporter.HTML.ImportDesc')}</p>
        <div class = "row">
            <div class="column"> 
                <p>${game.i18n.localize('npcImporter.HTML.ActorType')}:</p>
                <input type="radio" id="npc" name="actorType" value="npc" ${is_checked(
                  defaultData.actorType,
                  'npc'
                )}>
                <label for="NPC">NPC</lable><br>
                <input type="radio" id="character" name="actorType" value="character" ${is_checked(
                  defaultData.actorType,
                  'character'
                )}>
                <label for="character">Character</lable>
            </div>
            <div class="column"> 
                <p>${game.i18n.localize('npcImporter.HTML.Wildcard')}?</p>
                <input type="radio" id="yes" name="isWildcard" value="true" ${is_checked(
                  defaultData.isWildcard,
                  true
                )}>
                <label for="yes">Yes</lable><br>
                <input type="radio" id="no" name="isWildcard" value="false" ${is_checked(
                  defaultData.isWildcard,
                  false
                )}>
                <label for="no">No</lable>
            </div>
            <div class="column"> 
                <p>${game.i18n.localize('npcImporter.HTML.Disposition')}:</p>
                <input type="radio" id="hostile" name="disposition" value="-1" ${is_checked(
                  defaultData.tokenData.disposition,
                  -1
                )}>
                <label for="hostile">Hostile</lable><br>
                <input type="radio" id="neutral" name="disposition" value="0" ${is_checked(
                  defaultData.tokenData.disposition,
                  0
                )}>
                <label for="neutral">Neutral</lable><br>
                <input type="radio" id="friendly" name="disposition" value="1" ${is_checked(
                  defaultData.tokenData.disposition,
                  1
                )}>
                <label for="friendly">Friendly</lable>
            </div>
        </div>
        <div class="form-group">
            <p>${game.i18n.localize('TOKEN.VisionHas')}</p>
            <input type="checkbox" id="vision" name="vision" value="vision" ${
              defaultData.tokenData.vision == true ? 'checked' : ''
            }/>
        </div>
        <div class="form-group slim">
          <lable>Vision Radius</label>
          <div class="form-fields">
            <label>${game.i18n.localize('TOKEN.VisionDim')}</label>
            <input type="number" step="0.1" name="dimSight" value="${
              defaultData.tokenData.dimSight
            }" />
            <label>${game.i18n.localize('TOKEN.VisionBright')}</label>
            <input type="number" step="0.1" name="brightSight" value="${
              defaultData.tokenData.brightSight
            }" />
          </div>
          <div class="form-group slim">
            <label>${game.i18n.localize('TOKEN.VisionAngle')}</label>
            <div class="form-fields">
              <label>Degress (360 if empty)</label>
              <input type="number" name="sightAngle" value="${
                defaultData.tokenData.sightAngle
              }" />
            </div>
          </div>
        </div> 
        <br>
        <div class="form-group slim">
          <label>${game.i18n.localize('npcImporter.HTML.SaveFolder')} </label>
          <div class="form-fields">
            <select name="save-folder">${folderOptions}</select>
          </div>
        </div>
        <div class = "row">
            <label for="statBlock"><b>${game.i18n.localize(
              'npcImporter.HTML.StatBlock'
            )}</b></label>
            <textarea id="statBlock" name="statBlock" rows="10" autocomplete="off" placeholder="Paste statblock here ONLY if you're using Firefox or are over http..."></textarea>
        </div>
        </br>
        </form>
        `;
  return npcImporterDialog;
}

function is_checked(setValue, html_value) {
  if (setValue == html_value) {
    return 'checked';
  } else {
    return '';
  }
}

function buildFolderOptions() {
  let lastSave = getModuleSettings(settingLastSaveFolder);
  let folders = getAllActorFolders();
  let folderOptions = `<option value='' ${isLastSavedFolder(
    lastSave,
    ''
  )}>--</option>`;
  folders.forEach(folder => {
    folderOptions += `<option value="${folder.trim()}" ${isLastSavedFolder(
      lastSave,
      folder.trim()
    )}>${folder.trim()}</option>`;
  });
  return folderOptions;
}

function isLastSavedFolder(lastFolder, folderName) {
  if (lastFolder != undefined && lastFolder === folderName) {
    return 'selected';
  } else {
    return '';
  }
}
