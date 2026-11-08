import {
  getAllItemCompendiums,
  getAllPackageNames,
  getModuleSettings,
  updateModuleSetting,
  getAllActiveCompendiums,
} from '../utils/foundryActions';
import {
  settingPackageToUse,
  thisModule,
  settingCompsToUse,
  settingActiveCompendiums,
} from '../global';
import { SettingsData } from '../types/settingsData';

export default class SelectCompendiums extends foundry.applications.api.HandlebarsApplicationMixin(
  foundry.applications.api.ApplicationV2,
) {
  static override DEFAULT_OPTIONS = {
    id: `${thisModule}-compendiumsSelector`,
    tag: 'form',
    window: {
      title: 'npcImporter.settings.CompendiumsSelector',
    },
    position: {
      width: 300,
    },
    form: {
      handler: SelectCompendiums.#onSubmit,
      closeOnSubmit: true,
    },
  };

  static override PARTS = {
    form: {
      template: 'modules/swade-npc-importer/templates/CompendiumsToUse.hbs',
    },
  };

  override async _prepareContext(): Promise<any> {
    const settingsPackages = getModuleSettings(settingPackageToUse);
    const settingsComps = getModuleSettings(settingCompsToUse);
    const packs: SettingsData[] = getAllPackageNames().map(pk => ({
      name: pk,
      checked: isChecked(pk, settingsPackages),
    }));
    const comps: SettingsData[] = getAllItemCompendiums().map(compendium => ({
      name: compendium,
      checked: isChecked(compendium, settingsComps),
    }));
    return { packs, comps };
  }

  static async #onSubmit(
    _event: Event | SubmitEvent,
    _form: HTMLFormElement,
    formData: { object: Record<string, unknown> },
  ): Promise<void> {
    const packs: string[] = [];
    const comps: string[] = [];
    Object.entries(formData.object).forEach(([key, value]) => {
      if (!value) return;
      if (key.startsWith('pack.')) packs.push(key.replace('pack.', ''));
      if (key.startsWith('comp.')) comps.push(key.replace('comp.', ''));
    });

    await updateModuleSetting(settingPackageToUse, packs);
    await updateModuleSetting(settingCompsToUse, comps);

    // update Active Compendiums for Importer to use
    await updateModuleSetting(
      settingActiveCompendiums,
      getAllActiveCompendiums(),
    );
  }
}

function isChecked(item: string, settingsItems: string[]): string {
  return settingsItems?.includes(item) ? 'checked' : '';
}
