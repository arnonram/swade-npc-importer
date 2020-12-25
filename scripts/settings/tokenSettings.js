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
        return getModuleSettings(settingToken);
    }
    
    async _updateObject(event, formData) {
        await updateModuleSetting(settingToken, formData);
    }
}