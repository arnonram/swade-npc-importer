import { getActorAddtionalStatsArray } from '../utils/foundryActions.js';
import {
  settingActiveCompendiums,
  thisModule,
  settingPackageToUse,
  settingAdditionalTraits,
  settingDefaultActorType,
  settingDefaultIsWildcard,
  settingBulletPointIcons,
  settingLastSaveFolder,
  settingCompsToUse,
  settingParaeLanguage,
  settingToken,
  settingModifiedSpecialAbs,
  settingAutoCalcToughness,
  settingCalculateIgnoredWounds,
  settingCalculateAdditionalWounds,
  settingAutoCalcSize,
  settingallAsSpecialAbilities,
} from '../global.js';
import SelectCompendiums from './selectCompendiums.js';
import TokenSettings from './tokenSettings.js';

export class NpcImporterSettings {
  static async register() {
    game.settings.registerMenu(thisModule, settingCompsToUse, {
      name: game.i18n.localize('npcImporter.settings.CompendiumsSelector'),
      label: game.i18n.localize('npcImporter.settings.CompendiumsSelector'),
      hint: game.i18n.localize('npcImporter.settings.CompendiumsSelectorHint'),
      icon: 'fas fa-bars',
      type: SelectCompendiums,
      restricted: false,
    });
    game.settings.registerMenu(thisModule, 'tokenSettingMenu', {
      name: game.i18n.localize('npcImporter.settings.TokenSettings'),
      label: game.i18n.localize('npcImporter.settings.TokenSettings'),
      hint: game.i18n.localize('npcImporter.settings.TokenSettingsHint'),
      icon: 'fas fa-eye',
      type: TokenSettings,
      restricted: false,
    });
    game.settings.register(thisModule, settingToken, {
      name: 'Token settings',
      hint: 'Some default token settings',
      config: false,
      scope: 'world',
      type: Object,
      default: {
        disposition: -1,
        displayName: 0,
        vision: false,
        dimSight: 0,
        brightSight: 0,
        sightAngle: 360,
      },
    });
    game.settings.register(thisModule, settingPackageToUse, {
      name: 'Package for imports',
      hint: "Selecting a package will search through all its' Item compendiums for the correct item from the NPC statblock, and use it",
      config: false,
      scope: 'world',
      type: String,
    });
    game.settings.register(thisModule, settingCompsToUse, {
      name: 'Compendiums for imports',
      hint: 'NPC Importer will search through all selected Item compendiums for the correct item from the NPC statblock, and use it',
      config: false,
      scope: 'world',
      type: String,
    });
    game.settings.register(thisModule, settingParaeLanguage, {
      name: game.i18n.localize('npcImporter.settings.parseLanguage'),
      hint: game.i18n.localize('npcImporter.settings.parseLanguageHint'),
      config: true,
      scope: 'world',
      type: String,
      choices: {
        de: 'Deutsch',
        en: 'English',
        es: 'Español',
        'pt-BR': 'Português (Brasil)',
      },
    });
    game.settings.register(thisModule, settingDefaultActorType, {
      name: game.i18n.localize('npcImporter.settings.DefaultActorType'),
      config: true,
      scope: 'world',
      type: String,
      choices: {
        npc: game.i18n.localize('npcImporter.settings.NPC'),
        character: game.i18n.localize('npcImporter.settings.Character'),
      },
      default: 'npc',
    });
    game.settings.register(thisModule, settingDefaultIsWildcard, {
      name: game.i18n.localize('npcImporter.settings.DefaultIsWildcard'),
      config: true,
      scope: 'world',
      type: Boolean,
      default: false,
    });
    game.settings.register(thisModule, settingAdditionalTraits, {
      name: game.i18n.localize('npcImporter.settings.AdditionalTraits'),
      hint: game.i18n.localize('npcImporter.settings.AdditionalTraitsHint'),
      config: true,
      scope: 'world',
      type: String,
      default: getActorAddtionalStatsArray(),
    });
    game.settings.register(thisModule, settingBulletPointIcons, {
      name: game.i18n.localize('npcImporter.settings.BulletPointIcons'),
      hint: game.i18n.localize('npcImporter.settings.BulletPointIconsHint'),
      config: true,
      scope: 'world',
      type: String,
      default: '•|',
    });
    game.settings.register(thisModule, settingallAsSpecialAbilities, {
      name: game.i18n.localize('npcImporter.settings.AllAsSpecialAbilities'),
      hint: game.i18n.localize(
        'npcImporter.settings.AllAsSpecialAbilitiesHint'
      ),
      config: true,
      scope: 'world',
      type: Boolean,
      default: false,
    });
    game.settings.register(thisModule, settingModifiedSpecialAbs, {
      name: game.i18n.localize('npcImporter.settings.ModifiedSpecialAbilities'),
      hint: game.i18n.localize(
        'npcImporter.settings.ModifiedSpecialAbilitiesHint'
      ),
      config: true,
      scope: 'world',
      type: Boolean,
      default: false,
    });
    game.settings.register(thisModule, settingCalculateIgnoredWounds, {
      name: game.i18n.localize('npcImporter.settings.IgnoredWounds'),
      hint: game.i18n.localize('npcImporter.settings.IgnoredWoundsHint'),
      config: true,
      scope: 'world',
      type: Boolean,
      default: true,
    });
    game.settings.register(thisModule, settingCalculateAdditionalWounds, {
      name: game.i18n.localize('npcImporter.settings.AdditionalWounds'),
      hint: game.i18n.localize('npcImporter.settings.AdditionalWoundsHint'),
      config: true,
      scope: 'world',
      type: Boolean,
      default: true,
    });
    game.settings.register(thisModule, settingAutoCalcToughness, {
      name: game.i18n.localize('npcImporter.settings.AutoCalcToughness'),
      config: true,
      scope: 'world',
      type: Boolean,
      default: false,
    });
    game.settings.register(thisModule, settingAutoCalcSize, {
      name: game.i18n.localize('npcImporter.settings.SetSize'),
      hint: game.i18n.localize('npcImporter.settings.SetSizeHint'),
      config: true,
      scope: 'world',
      type: Boolean,
      default: true,
    });
    game.settings.register(thisModule, settingLastSaveFolder, {
      name: 'Set the last save folder',
      config: false,
      scope: 'world',
      type: String,
    });
    game.settings.register(thisModule, settingActiveCompendiums, {
      name: 'Compendiums in use by Importer',
      config: false,
      scope: 'world',
      type: String,
    });
  }
}
