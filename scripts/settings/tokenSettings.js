import { settingToken, thisModule } from "../global.js";
import {updateModuleSetting, getModuleSettings} from "../utils/foundryActions.js";

export default class TokenSettings extends FormApplication {
    constructor(object = {}, options = {}) {
        super(object, options);
    }

    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            id: `${thisModule}.tokenSettings`,
            title: game.i18n.localize("npcImporter.settings.TokenSettings"),
            template: "modules/swade-npc-importer/templates/TokenSettings.html",
            width: 300,
            closeOnSubmit: true
        });
    }

    getData() {
        const currentTokenValues = getModuleSettings(settingToken);
        return {
            dispositionHostile: {
                value: "HOSTILE",
                selected: currentTokenValues.disposition == 'HOSTILE' ? 'selected' : ''
            },
            dispositionNeutral: {
                value: "NEUTRAL",
                selected: currentTokenValues.disposition == 'NEUTRAL' ? 'selected' : ''
            },
            dispositionFriendly: {
                value: "FRIENDLY",
                selected: currentTokenValues.disposition == 'FRIENDLY' ? 'selected' : ''
            },
            displayNameDISPLAY_ALWAYS: {
                value: "DISPLAY_ALWAYS",
                selected: currentTokenValues.displayName == 'DISPLAY_ALWAYS' ? 'selected' : ''
            },
            displayNameDISPLAY_CONTROL: {
                value: "DISPLAY_CONTROL",
                selected: currentTokenValues.displayName == 'DISPLAY_CONTROL' ? 'selected' : ''
            },
            displayNameDISPLAY_HOVER: {
                value: "DISPLAY_HOVER",
                selected: currentTokenValues.displayName == 'DISPLAY_HOVER' ? 'selected' : ''
            },
            displayNameDISPLAY_NONE: {
                value: "DISPLAY_NONE",
                selected: currentTokenValues.displayName == 'DISPLAY_NONE' ? 'selected' : ''
            },
            displayNameDISPLAY_OWNER: {
                value: "DISPLAY_OWNER",
                selected: currentTokenValues.displayName == 'DISPLAY_OWNER' ? 'selected' : ''
            },
            displayNameDISPLAY_OWNER_HOVER: {
                value: "DISPLAY_OWNER_HOVER",
                selected: currentTokenValues.displayName == 'DISPLAY_OWNER_HOVER' ? 'selected' : ''
            },
            vision: {
                checked: currentTokenValues.vision ? 'checked' : ''
            },
            dimSight: currentTokenValues.dimSight,
            brightSight: currentTokenValues.brightSight
            // TODO 
            // displayBars: "DISPLAY_NONE",
            // bar1Attribute: "",
            // bar2Attribute: "",
          }
    }
    
    async _updateObject(event, formData) {
        await updateModuleSetting(settingToken, formData);
    }
}