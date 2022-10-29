import { settingToken, thisModule } from '../global.js';
import {
  updateModuleSetting,
  getModuleSettings,
} from '../utils/foundryActions.js';

export default class TokenSettings extends FormApplication {
  constructor(object = {}, options = {}) {
    super(object, options);
  }

  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      id: `${thisModule}.tokenSettings`,
      title: game.i18n.localize('npcImporter.settings.TokenSettings'),
      template:
        'modules/swade-stat-block-importer/templates/TokenSettings.html',
      width: '400',
      closeOnSubmit: true,
    });
  }

  getData() {
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

  async _updateObject(event, formData) {
    await updateModuleSetting(settingToken, formData);
  }
}
