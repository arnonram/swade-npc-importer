import { getActorAddtionalStatsArray } from '../utils/foundryActions';
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
  settingParseLanguage,
  settingToken,
  settingModifiedSpecialAbs,
  settingAutoCalcToughness,
  settingCalculateIgnoredWounds,
  settingCalculateAdditionalWounds,
  settingAutoCalcSize,
  settingallAsSpecialAbilities,
  twoHandsNotaiton,
  settingNumberOfBennies,
} from '../global';
import SelectCompendiums from './selectCompendiums';
import TokenSettings from './tokenSettings';
import { foundryI18nLocalize } from '../utils/foundryWrappers';

export class NpcImporterSettings {
  static async register() {
    game.settings?.registerMenu(thisModule, settingCompsToUse, {
      name: foundryI18nLocalize('npcImporter.settings.CompendiumsSelector'),
      label: foundryI18nLocalize('npcImporter.settings.CompendiumsSelector'),
      hint: foundryI18nLocalize('npcImporter.settings.CompendiumsSelectorHint'),
      icon: 'fas fa-bars',
      type: SelectCompendiums,
      restricted: false,
    });
    game.settings?.registerMenu(thisModule, 'tokenSettingMenu', {
      name: foundryI18nLocalize('npcImporter.settings.TokenSettings'),
      label: foundryI18nLocalize('npcImporter.settings.TokenSettings'),
      hint: foundryI18nLocalize('npcImporter.settings.TokenSettingsHint'),
      icon: 'fas fa-eye',
      type: TokenSettings,
      restricted: false,
    });
    //@ts-expect-error foundry-types
    game.settings?.register(thisModule, settingToken, {
      name: 'Token settings',
      hint: 'Some default token settings',
      config: false,
      scope: 'world',
      type: Object,
      default: {
        disposition: -1,
        displayName: 0,
        vision: false,
        visionRange: 0,
        visionAngle: 360,
      },
    });
    //@ts-expect-error foundry-types
    game.settings?.register(thisModule, settingPackageToUse, {
      name: 'Package for imports',
      hint: 'Selecting a package will search through all its\' Item compendiums for the correct item from the NPC statblock, and use it',
      config: false,
      scope: 'world',
      type: Array,
      default: [],
    });
    //@ts-expect-error foundry-types
    game.settings?.register(thisModule, settingCompsToUse, {
      name: 'Compendiums for imports',
      hint: 'NPC Importer will search through all selected Item compendiums for the correct item from the NPC statblock, and use it',
      config: false,
      scope: 'world',
      type: Array,
      default: [],
    });
    //@ts-expect-error foundry-types
    game.settings?.register(thisModule, settingParseLanguage, {
      name: foundryI18nLocalize('npcImporter.settings.parseLanguage'),
      hint: foundryI18nLocalize('npcImporter.settings.parseLanguageHint'),
      config: true,
      scope: 'world',
      type: String,
      choices: {
        en: 'English',
        de: 'Deutsch',
        es: 'Español',
        fr: 'Français',
        'pt-BR': 'Português (Brasil)',
      },
      default: 'en',
    });
    //@ts-expect-error foundry-types
    game.settings?.register(thisModule, settingDefaultActorType, {
      name: foundryI18nLocalize('npcImporter.settings.DefaultActorType'),
      config: true,
      scope: 'world',
      type: String,
      choices: {
        npc: foundryI18nLocalize('npcImporter.settings.NPC'),
        character: foundryI18nLocalize('npcImporter.settings.Character'),
      },
      default: 'npc',
    });
    //@ts-expect-error foundry-types
    game.settings?.register(thisModule, settingDefaultIsWildcard, {
      name: foundryI18nLocalize('npcImporter.settings.DefaultIsWildcard'),
      config: true,
      scope: 'world',
      type: Boolean,
      default: false,
    });
    //@ts-expect-error foundry-types
    game.settings?.register(thisModule, settingNumberOfBennies, {
      name: foundryI18nLocalize('npcImporter.settings.NumberOfBennies'),
      hint: foundryI18nLocalize('npcImporter.settings.NumberOfBenniesHint'),
      config: true,
      scope: 'world',
      type: Number,
      default: 2,
    });
    //@ts-expect-error foundry-types
    game.settings?.register(thisModule, settingAdditionalTraits, {
      name: foundryI18nLocalize('npcImporter.settings.AdditionalTraits'),
      hint: foundryI18nLocalize('npcImporter.settings.AdditionalTraitsHint'),
      config: true,
      scope: 'world',
      type: String,
      default: getActorAddtionalStatsArray(),
    });
    //@ts-expect-error foundry-types
    game.settings?.register(thisModule, settingBulletPointIcons, {
      name: foundryI18nLocalize('npcImporter.settings.BulletPointIcons'),
      hint: foundryI18nLocalize('npcImporter.settings.BulletPointIconsHint'),
      config: true,
      scope: 'world',
      type: String,
      default: '•|',
    });
    //@ts-expect-error foundry-types
    game.settings?.register(thisModule, twoHandsNotaiton, {
      name: foundryI18nLocalize('npcImporter.settings.TwoHandsNotationTitle'),
      hint: foundryI18nLocalize('npcImporter.settings.TwoHandsNotationHint'),
      config: true,
      scope: 'world',
      type: String,
      default: foundryI18nLocalize('npcImporter.settings.TwoHandsNotation'),
    });
    //@ts-expect-error foundry-types
    game.settings?.register(thisModule, settingallAsSpecialAbilities, {
      name: foundryI18nLocalize('npcImporter.settings.AllAsSpecialAbilities'),
      hint: foundryI18nLocalize(
        'npcImporter.settings.AllAsSpecialAbilitiesHint',
      ),
      config: true,
      scope: 'world',
      type: Boolean,
      default: false,
    });
    //@ts-expect-error foundry-types
    game.settings?.register(thisModule, settingModifiedSpecialAbs, {
      name: foundryI18nLocalize(
        'npcImporter.settings.ModifiedSpecialAbilities',
      ),
      hint: foundryI18nLocalize(
        'npcImporter.settings.ModifiedSpecialAbilitiesHint',
      ),
      config: true,
      scope: 'world',
      type: Boolean,
      default: false,
    });
    //@ts-expect-error foundry-types
    game.settings?.register(thisModule, settingCalculateIgnoredWounds, {
      name: foundryI18nLocalize('npcImporter.settings.IgnoredWounds'),
      hint: foundryI18nLocalize('npcImporter.settings.IgnoredWoundsHint'),
      config: true,
      scope: 'world',
      type: Boolean,
      default: true,
    });
    //@ts-expect-error foundry-types
    game.settings?.register(thisModule, settingCalculateAdditionalWounds, {
      name: foundryI18nLocalize('npcImporter.settings.AdditionalWounds'),
      hint: foundryI18nLocalize('npcImporter.settings.AdditionalWoundsHint'),
      config: true,
      scope: 'world',
      type: Boolean,
      default: true,
    });
    //@ts-expect-error foundry-types
    game.settings?.register(thisModule, settingAutoCalcToughness, {
      name: foundryI18nLocalize('npcImporter.settings.AutoCalcToughness'),
      config: true,
      scope: 'world',
      type: Boolean,
      default: false,
    });
    //@ts-expect-error foundry-types
    game.settings?.register(thisModule, settingAutoCalcSize, {
      name: foundryI18nLocalize('npcImporter.settings.SetSize'),
      hint: foundryI18nLocalize('npcImporter.settings.SetSizeHint'),
      config: true,
      scope: 'world',
      type: Boolean,
      default: true,
    });
    //@ts-expect-error foundry-types
    game.settings?.register(thisModule, settingLastSaveFolder, {
      name: 'Set the last save folder',
      config: false,
      scope: 'world',
      type: String,
      default: '',
    });
    //@ts-expect-error foundry-types
    game.settings?.register(thisModule, settingActiveCompendiums, {
      name: 'Compendiums in use by Importer',
      config: false,
      scope: 'world',
      type: Array,
      default: [],
    });
    //@ts-expect-error foundry-types
    game.settings?.register(thisModule, 'renderSheet', {
      name: foundryI18nLocalize('npcImporter.settings.RenderSheet'),
      config: true,
      scope: 'world',
      type: Boolean,
      default: false,
    });
  }
}
