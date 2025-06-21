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
        position: {
          width: 400,
        },
        content: importerDialog(),
        buttons: [
          {
            action: 'importActor',
            label: game.i18n?.localize('npcImporter.HTML.Import') as string,
            default: true,
            callback: (html: any) => {
              let importSettings: ImportSettings = {
                actorType: document.querySelector(
                  'input[name="actorType"]:checked',
                  //@ts-ignore
                )?.value,
                isWildCard: !!document.getElementById(
                  'swade-stat-imp-isWildCard',
                  //@ts-ignore
                )?.checked,
                tokenSettings: {
                  disposition: parseInt(
                    //@ts-ignore
                    document.querySelector('input[name="disposition"]:checked')
                      ?.value,
                  ),
                  vision: !!//@ts-ignore
                  document.getElementById('swade-stat-imp-vision')?.checked,
                  visionRange: parseInt(
                    //@ts-ignore
                    document.querySelector('input[name="visionRange"]')?.value,
                  ),
                  visionAngle: parseInt(
                    //@ts-ignore
                    document.querySelector('input[name="visionAngle"]')?.value,
                  ),
                },
                saveFolder: document.getElementById(
                  'swade-stat-imp-save-folder',
                  //@ts-ignore
                )?.value,
              };
              buildActor(
                importSettings,
                //@ts-ignore
                document.getElementById('statBlock')?.value,
              );
            },
          },
          {
            action: 'cancel',
            label: 'Cancel',
          },
        ],
      }).render({ force: true });
    });
  }
});

function importerDialog(): string {
  const defaultData = {
    actorType: getModuleSettings(settingDefaultActorType),
    isWildcard: getModuleSettings(settingDefaultIsWildcard),
    tokenData: getModuleSettings(settingToken),
  };
  const folderOptions = buildFolderOptions();

  const npcImporterDialog = `
  <form>
    <p>${game.i18n?.localize('npcImporter.HTML.ImportDesc')}</p>

    <!-- Actor Options -->
    <div class="form-group">
      <label class="form-header"><b>${game.i18n?.localize('npcImporter.HTML.ActorType')}</b></label>
      <div class="flexrow">
        <label>
          <input type="radio" id="swade-stat-imp-actorType" name="actorType" value="npc" ${isChecked(defaultData.actorType, 'npc')} />
          ${game.i18n?.localize('npcImporter.settings.NPC')}
        </label>
        <label>
          <input type="radio" id="swade-stat-imp-actorType" name="actorType" value="character" ${isChecked(defaultData.actorType, 'character')} />
          ${game.i18n?.localize('npcImporter.settings.Character')}
        </label>
      </div>
    </div>

    <!-- Wildcard -->
    <div class="form-group">
      <label>
        <input type="checkbox" id="swade-stat-imp-isWildCard" name="isWildcard" value="true" ${defaultData.isWildcard ? 'checked' : ''} />
        ${game.i18n?.localize('npcImporter.HTML.Wildcard')}
      </label>
    </div>

    <!-- Disposition -->
    <div class="form-group">
      <label class="form-header"><b>${game.i18n?.localize('npcImporter.HTML.Disposition')}</b></label>
      <div class="flexrow">
        <label>
          <input type="radio" id="swade-stat-imp-disposition" name="disposition" value="-1" ${isChecked(defaultData.tokenData.disposition, -1)} />
          ${game.i18n?.localize('npcImporter.settings.Hostile')}
        </label>
        <label>
          <input type="radio" id="swade-stat-imp-disposition" name="disposition" value="0" ${isChecked(defaultData.tokenData.disposition, 0)} />
          ${game.i18n?.localize('npcImporter.settings.Neutral')}
        </label>
        <label>
          <input type="radio" id="swade-stat-imp-disposition" name="disposition" value="1" ${isChecked(defaultData.tokenData.disposition, 1)} />
          ${game.i18n?.localize('npcImporter.settings.Friendly')}
        </label>
        <label>
          <input type="radio" id="swade-stat-imp-disposition" name="disposition" value="-2" ${isChecked(defaultData.tokenData.disposition, -2)} />
          ${game.i18n?.localize('npcImporter.settings.Secret')}
        </label>
      </div>
    </div>

    <!-- Vision Settings -->
    <div class="form-group">
      <label>
        <input type="checkbox" id="swade-stat-imp-vision" name="vision" ${defaultData.tokenData.vision ? 'checked' : ''} />
        ${game.i18n?.localize('TOKEN.FIELDS.sight.enabled.label')}
      </label>
    </div>
    <div class="form-group flexrow">
      <label style="flex: 1;">
        ${game.i18n?.localize('TOKEN.FIELDS.sight.range.label')}
        <input type="number" id="swade-stat-imp-visionRange" name="visionRange" step="1" value="${defaultData.tokenData.visionRange}" />
      </label>
      <label style="flex: 1;">
        ${game.i18n?.localize('TOKEN.FIELDS.sight.angle.label')}
        <input type="number" id="swade-stat-imp-visionAngle" name="visionAngle" step="1" max="360" value="${defaultData.tokenData.visionAngle}" />
      </label>
    </div>

    <!-- Save Folder -->
    <div class="form-group">
      <label>
        ${game.i18n?.localize('npcImporter.HTML.SaveFolder')}
        <select id="swade-stat-imp-save-folder" name="save-folder" style="width: 100%;">${folderOptions}</select>
      </label>
    </div>

    <!-- Statblock -->
    <div class="form-group">
      <label for="statBlock"><b>${game.i18n?.localize('npcImporter.HTML.StatBlock')}</b></label>
      <textarea
        id="statBlock"
        name="statBlock"
        rows="10"
        style="width: 100%;"
        autocomplete="off"
        placeholder="${game.i18n?.localize('npcImporter.HTML.Firefox')}"
      ></textarea>
    </div>
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
