import { settingToken, thisModule } from '../global';
import {
  updateModuleSetting,
  getModuleSettings,
} from '../utils/foundryActions';

export default class TokenSettings extends foundry.applications.api.HandlebarsApplicationMixin(
  foundry.applications.api.ApplicationV2,
) {
  static override DEFAULT_OPTIONS = {
    id: `${thisModule}-tokenSettings`,
    tag: 'form',
    window: {
      title: 'npcImporter.settings.TokenSettings',
    },
    position: {
      width: 400,
    },
    form: {
      handler: TokenSettings.#onSubmit,
      closeOnSubmit: true,
    },
  };

  static override PARTS = {
    form: {
      template: 'modules/swade-npc-importer/templates/TokenSettings.hbs',
    },
  };

  override async _prepareContext(): Promise<any> {
    const currentTokenValues = getModuleSettings(settingToken);
    const selected = (current: unknown, value: number) =>
      // biome-ignore lint/suspicious/noDoubleEquals: stored setting may be a string
      current == value ? 'selected' : '';
    const disposition = currentTokenValues.disposition;
    const displayName = currentTokenValues.displayName;
    return {
      dispositionHostile: { selected: selected(disposition, -1) },
      dispositionNeutral: { selected: selected(disposition, 0) },
      dispositionFriendly: { selected: selected(disposition, 1) },
      dispositionSecret: { selected: selected(disposition, -2) },
      displayNameDISPLAY_NONE: { selected: selected(displayName, 0) },
      displayNameDISPLAY_CONTROL: { selected: selected(displayName, 10) },
      displayNameDISPLAY_OWNER_HOVER: { selected: selected(displayName, 20) },
      displayNameDISPLAY_HOVER: { selected: selected(displayName, 30) },
      displayNameDISPLAY_OWNER: { selected: selected(displayName, 40) },
      displayNameDISPLAY_ALWAYS: { selected: selected(displayName, 50) },
      vision: { checked: currentTokenValues.vision ? 'checked' : '' },
      visionRange: currentTokenValues.visionRange ?? 0,
      visionAngle: currentTokenValues.visionAngle ?? 360,
    };
  }

  static async #onSubmit(
    _event: Event | SubmitEvent,
    _form: HTMLFormElement,
    formData: { object: Record<string, unknown> },
  ): Promise<void> {
    await updateModuleSetting(settingToken, formData.object);
  }
}
