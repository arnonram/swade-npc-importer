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
import { foundryI18nLocalize } from '../utils/foundryWrappers';
import { SettingsData } from '../types/settingsData';

export default class SelectCompendiums extends FormApplication {
  constructor(object = {}, options = {}) {
    super(object, options);
  }

  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      id: `${thisModule}.compendiumsSelector`,
      title: foundryI18nLocalize('npcImporter.settings.CompendiumsSelector'),
      template: 'modules/swade-npc-importer/templates/CompendiumsToUse.hbs',
      width: 300,
      closeOnSubmit: true,
    });
  }

  override async getData(): Promise<{
    packs: SettingsData[];
    comps: SettingsData[];
  }> {
    const data: {
      packs: SettingsData[];
      comps: SettingsData[];
    } = {
      packs: [],
      comps: [],
    };

    let allPackages = getAllPackageNames();
    let settingsPackages = getModuleSettings(settingPackageToUse);
    allPackages.forEach(pk => {
      data.packs.push({
        name: pk,
        checked: isChecked(pk, settingsPackages),
      });
    });

    let allCompendiums = getAllItemCompendiums();
    let settingsComps = getModuleSettings(settingCompsToUse);
    allCompendiums.forEach(compendium => {
      data.comps.push({
        name: compendium,
        checked: isChecked(compendium, settingsComps),
      });
    });
    return data;
  }

  override async _updateObject(
    event: Event,
    formData: Record<string, unknown>,
  ): Promise<void> {
    let keys = Object.keys(formData);

    let packs: string[] = [];
    let comps: string[] = [];
    keys.forEach(element => {
      if (element.startsWith('pack')) {
        if (formData[element]) {
          packs.push(element.replace('pack.', ''));
        }
      }
      if (element.startsWith('comp')) {
        if (formData[element]) {
          comps.push(element.replace('comp.', ''));
        }
      }
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
  if (settingsItems != undefined) {
    return settingsItems.find(x => x == item) ? 'checked' : '';
  } else {
    return '';
  }
}
