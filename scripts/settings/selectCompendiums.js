import { GetAllItemCompendiums, getAllPackageNames, getModuleSettings, updateModuleSetting, getAllActiveCompendiums } from "../foundryActions.js";
import { log, settingPackageToUse, thisModule, settingCompsToUse, settingActiveCompendiums } from "../global.js";

export default class SelectCompendiums extends FormApplication {
    constructor(object = {}, options = {}) {
        super(object, options);
    }

    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            id: `${thisModule}.compendiumsSelector`,
            title: game.i18n.localize("Settings.CompendiumsSelector"),
            template: "modules/swade-npc-importer/templates/CompendiumsToUse.html",
            width: 300,
            closeOnSubmit: true
        });
    }

    getData() {
        let data = {
            packs: [],
            comps: []
        }

        let allPackages = getAllPackageNames();
        let settingsPackages = getModuleSettings(settingPackageToUse)
        allPackages.forEach(pk => {
            data.packs.push({
                name: pk,
                checked: isChecked(pk, settingsPackages)
            })
        });

        let allComps = GetAllItemCompendiums();
        let settingsComps = getModuleSettings(settingCompsToUse)
        allComps.forEach(cmp => {
            data.comps.push({
                name: cmp,
                checked: isChecked(cmp, settingsComps)
            })
        });
        return data;
    }

    async _updateObject(event, formData) {
        let keys = Object.keys(formData);

        let packs = [];
        let comps = [];
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
        await updateModuleSetting(settingActiveCompendiums, getAllActiveCompendiums())
    }
}

function isChecked(item, settingsItems) {
    if (settingsItems != undefined) {
        return settingsItems.split(',').filter(x => x == item).length == 1
            ? "checked"
            : ""
    } else {
        return '';
    }
}