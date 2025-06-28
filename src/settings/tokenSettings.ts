import { settingToken, thisModule } from '../global';
import {
  updateModuleSetting,
  getModuleSettings,
} from '../utils/foundryActions';
import { foundryI18nLocalize } from '../utils/foundryWrappers';

export default class TokenSettings extends FormApplication {
  constructor(object = {}, options = {}) {
    super(object, options);
  }

  static override get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      id: `${thisModule}.tokenSettings`,
      title: foundryI18nLocalize('npcImporter.settings.TokenSettings'),
      template: 'modules/swade-npc-importer/templates/TokenSettings.hbs',
      width: 400,
      closeOnSubmit: true,
    });
  }

  override async getData() {
    const currentTokenValues = getModuleSettings(settingToken);
    return {
      dispositionHostile: {
        value: 'HOSTILE',
        selected: currentTokenValues.disposition == -1 ? 'selected' : '',
      },
      dispositionNeutral: {
        value: 'NEUTRAL',
        selected: currentTokenValues.disposition == 0 ? 'selected' : '',
      },
      dispositionFriendly: {
        value: 'FRIENDLY',
        selected: currentTokenValues.disposition == 1 ? 'selected' : '',
      },
      dispositionSecret: {
        value: 'SECRET',
        selected: currentTokenValues.disposition == -2 ? 'selected' : '',
      },
      displayNameDISPLAY_NONE: {
        value: 'DISPLAY_NONE',
        selected: currentTokenValues.displayName == 0 ? 'selected' : '',
      },
      displayNameDISPLAY_CONTROL: {
        value: 'DISPLAY_CONTROL',
        selected: currentTokenValues.displayName == 10 ? 'selected' : '',
      },
      displayNameDISPLAY_OWNER_HOVER: {
        value: 'DISPLAY_OWNER_HOVER',
        selected: currentTokenValues.displayName == 20 ? 'selected' : '',
      },
      displayNameDISPLAY_HOVER: {
        value: 'DISPLAY_HOVER',
        selected: currentTokenValues.displayName == 30 ? 'selected' : '',
      },
      displayNameDISPLAY_OWNER: {
        value: 'DISPLAY_OWNER',
        selected: currentTokenValues.displayName == 40 ? 'selected' : '',
      },
      displayNameDISPLAY_ALWAYS: {
        value: 'DISPLAY_ALWAYS',
        selected: currentTokenValues.displayName == 50 ? 'selected' : '',
      },
      vision: {
        checked: currentTokenValues.vision ? 'checked' : '',
      },
      visionRange: currentTokenValues.visionRange ?? 0,
      visionAngle: currentTokenValues.visionAngle ?? 360,
    };
  }

  override async _updateObject(
    event: Event,
    formData: Record<string, unknown>,
  ) {
    await updateModuleSetting(settingToken, formData);
  }
}
