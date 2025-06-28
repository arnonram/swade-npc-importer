import { buildActor } from './actorBuilder';
import {
  settingDefaultActorType,
  settingDefaultIsWildcard,
  settingLastSaveFolder,
  settingActiveCompendiums,
  settingToken,
} from './global';
import { NpcImporterSettings } from './settings/npcImporterSettings';
import { ImportSettings } from './types/importedActor';
import {
  getModuleSettings,
  getAllActorFolders,
  updateModuleSetting,
  getAllActiveCompendiums,
} from './utils/foundryActions';
import { foundryI18nLocalize, foundryUiError } from './utils/foundryWrappers';
import { Logger } from './utils/logger';
import { buildFolderOptions, isChecked } from './utils/dialogUtils';

function canCreateActor(): boolean {
  return !!(
    game.userId && game.users?.get(game.userId)?.can('ACTOR_CREATE') === true
  );
}

Hooks.on('ready', async () => {
  if (canCreateActor()) {
    Logger.info('Setting up settings...');
    await NpcImporterSettings.register();
    // update Active Compendiums for Importer to use
    await updateModuleSetting(
      settingActiveCompendiums,
      getAllActiveCompendiums(),
    );
  }
});

Hooks.on('renderActorDirectory', async (app: any, html: any, _data: any) => {
  if (canCreateActor()) {
    const npcImporterButton = $(
      `<button id="StatBlockImporterButton" style="width: calc(100% - 8px);"><i class="fas fa-align-left"></i>${foundryI18nLocalize(
        'npcImporter.HTML.StatBlockImporterTitle',
      )}</button>`,
    );

    $(html).find('.directory-footer').append(npcImporterButton);

    npcImporterButton.on('click', async () => {
      new foundry.applications.api.DialogV2({
        window: {
          title: foundryI18nLocalize('npcImporter.HTML.ImportTitle'),
          resizable: true,
        },
        position: {
          width: 400,
        },
        content: await importerDialog(),
        buttons: [
          {
            action: 'importActor',
            label: foundryI18nLocalize('npcImporter.HTML.Import'),
            default: true,
            callback: async (_html: any) => {
              try {
                let importSettings: ImportSettings = {
                  actorType:
                    (
                      document.querySelector(
                        'input[name="actorType"]:checked',
                      ) as HTMLInputElement | null
                    )?.value ?? '',
                  isWildCard: !!(
                    document.getElementById(
                      'swade-stat-imp-isWildCard',
                    ) as HTMLInputElement | null
                  )?.checked,
                  tokenSettings: {
                    disposition: parseInt(
                      (
                        document.querySelector(
                          'input[name="disposition"]:checked',
                        ) as HTMLInputElement | null
                      )?.value ?? '0',
                    ),
                    vision: !!(
                      document.getElementById(
                        'swade-stat-imp-vision',
                      ) as HTMLInputElement | null
                    )?.checked,
                    visionRange: parseInt(
                      (
                        document.querySelector(
                          'input[name="visionRange"]',
                        ) as HTMLInputElement | null
                      )?.value ?? '0',
                    ),
                    visionAngle: parseInt(
                      (
                        document.querySelector(
                          'input[name="visionAngle"]',
                        ) as HTMLInputElement | null
                      )?.value ?? '360',
                    ),
                  },
                  saveFolder:
                    (
                      document.getElementById(
                        'swade-stat-imp-save-folder',
                      ) as HTMLInputElement | null
                    )?.value ?? '',
                };
                const statBlock = (
                  document.getElementById('statBlock') as
                    | HTMLInputElement
                    | undefined
                )?.value;
                await buildActor(importSettings, statBlock);
              } catch (err) {
                Logger.error('Import failed:', err);
                foundryUiError(
                  foundryI18nLocalize('npcImporter.HTML.FailedToImport'),
                );
              }
            },
          },
          {
            action: 'cancel',
            label: foundryI18nLocalize('npcImporter.HTML.Cancel'),
          },
        ],
      }).render({ force: true });
    });
  }
});

async function importerDialog(): Promise<string> {
  const defaultData = {
    actorType: getModuleSettings(settingDefaultActorType),
    isWildcard: getModuleSettings(settingDefaultIsWildcard),
    tokenData: getModuleSettings(settingToken),
  };
  const lastSave = getModuleSettings(settingLastSaveFolder);
  const folders = getAllActorFolders();
  const folderOptions = buildFolderOptions(lastSave, folders);

  // Prepare template data
  const templateData = {
    importDesc: foundryI18nLocalize('npcImporter.HTML.ImportDesc'),
    actorTypeLabel: foundryI18nLocalize('npcImporter.HTML.ActorType'),
    npcLabel: foundryI18nLocalize('npcImporter.settings.NPC'),
    characterLabel: foundryI18nLocalize('npcImporter.settings.Character'),
    actorType: defaultData.actorType,
    isWildcard: defaultData.isWildcard,
    wildcardLabel: foundryI18nLocalize('npcImporter.HTML.Wildcard'),
    dispositionLabel: foundryI18nLocalize('npcImporter.HTML.Disposition'),
    disposition: defaultData.tokenData.disposition,
    hostileLabel: foundryI18nLocalize('npcImporter.settings.Hostile'),
    neutralLabel: foundryI18nLocalize('npcImporter.settings.Neutral'),
    friendlyLabel: foundryI18nLocalize('npcImporter.settings.Friendly'),
    secretLabel: foundryI18nLocalize('npcImporter.settings.Secret'),
    vision: defaultData.tokenData.vision,
    sightEnabledLabel: foundryI18nLocalize('TOKEN.FIELDS.sight.enabled.label'),
    visionRange: defaultData.tokenData.visionRange,
    sightRangeLabel: foundryI18nLocalize('TOKEN.FIELDS.sight.range.label'),
    visionAngle: defaultData.tokenData.visionAngle,
    sightAngleLabel: foundryI18nLocalize('TOKEN.FIELDS.sight.angle.label'),
    saveFolderLabel: foundryI18nLocalize('npcImporter.HTML.SaveFolder'),
    folderOptions,
    statBlockLabel: foundryI18nLocalize('npcImporter.HTML.StatBlock'),
    firefoxLabel: foundryI18nLocalize('npcImporter.HTML.Firefox'),
    isChecked,
  };

  // Render Handlebars template
  const html = await foundry.applications.handlebars.renderTemplate(
    'modules/swade-npc-importer/templates/ImporterDialog.hbs',
    templateData,
  );
  return html;
}
