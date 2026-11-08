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
import { buildFolderOptions, isChecked, isSelected } from './utils/dialogUtils';

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

Hooks.on('renderActorDirectory', (_app: any, html: HTMLElement) => {
  if (canCreateActor()) {
    const footer = html.querySelector('.directory-footer');
    if (!footer || footer.querySelector('#StatBlockImporterButton')) return;

    const npcImporterButton = document.createElement('button');
    npcImporterButton.type = 'button';
    npcImporterButton.id = 'StatBlockImporterButton';
    npcImporterButton.style.width = 'calc(100% - 8px)';
    npcImporterButton.innerHTML = `<i class="fas fa-align-left"></i>${foundryI18nLocalize(
      'npcImporter.HTML.StatBlockImporterTitle',
    )}`;
    footer.append(npcImporterButton);

    npcImporterButton.addEventListener('click', async () => {
      const dialog = await new foundry.applications.api.DialogV2({
        window: {
          title: foundryI18nLocalize('npcImporter.HTML.ImportTitle'),
          resizable: true,
        },
        position: {
          width: 460,
        },
        content: await importerDialog(),
        buttons: [
          {
            action: 'importActor',
            label: foundryI18nLocalize('npcImporter.HTML.Import'),
            default: true,
            callback: async (_event: Event, button: HTMLButtonElement) => {
              try {
                const fields = button.form!.elements;
                const value = (name: string): string =>
                  (fields.namedItem(name) as HTMLInputElement | RadioNodeList)
                    ?.value ?? '';
                const checked = (name: string): boolean =>
                  !!(fields.namedItem(name) as HTMLInputElement | null)
                    ?.checked;
                const importSettings: ImportSettings = {
                  actorType: value('actorType'),
                  isWildCard: checked('isWildcard'),
                  tokenSettings: {
                    disposition: parseInt(value('disposition') || '0'),
                    vision: checked('vision'),
                    visionRange: parseInt(value('visionRange') || '0'),
                    visionAngle: parseInt(value('visionAngle') || '360'),
                  },
                  saveFolder: value('save-folder'),
                };
                const statBlock = value('statBlock');
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
      // DialogV2 strips the placeholder attribute from its content, so set it after rendering.
      const statBlockInput =
        dialog.element.querySelector<HTMLTextAreaElement>('#statBlock');
      if (statBlockInput) {
        statBlockInput.placeholder = foundryI18nLocalize(
          'npcImporter.HTML.Firefox',
        );
      }
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
    isChecked,
    isSelected,
  };

  // Render Handlebars template
  const html = await foundry.applications.handlebars.renderTemplate(
    'modules/swade-npc-importer/templates/ImporterDialog.hbs',
    templateData,
  );
  return html;
}
