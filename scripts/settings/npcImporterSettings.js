import { getActorAddtionalStats } from "../foundryActions.js";
import {
    settingActiveCompendiums, thisModule, settingPackageToUse, settingAdditionalTraits,
    settingDefaultDisposition, settingDefaultActorType, settingDefaultIsWildcard,
    settingBulletPointIcons, settingLastSaveFolder, settingCompsToUse
} from "../global.js";
import SelectCompendiums from "./selectCompendiums.js";

export class NpcImporterSettings {
    static async register() {
        game.settings.registerMenu(thisModule, settingCompsToUse, {
            name: game.i18n.localize("Settings.SelectItemCompendiums"),
            label: game.i18n.localize("Settings.SelectItemCompendiums"),
            hint: game.i18n.localize("Settings.SelectItemCompendiumsHints"),
            icon: "fas fa-bars",
            type: SelectCompendiums,
            restricted: false
        });
        game.settings.register(thisModule, settingPackageToUse, {
            name: "Package for imports",
            hint: "Selecting a package will search through all its' Item compendiums for the correct item from the NPC statblock, and use it",
            config: false,
            scope: "world",
            type: String
        });
        game.settings.register(thisModule, settingCompsToUse, {
            name: "Package for imports",
            hint: "NPC Importer will search through all selected Item compendiums for the correct item from the NPC statblock, and use it",
            config: false,
            scope: "world",
            type: String
        });

        game.settings.register(thisModule, settingDefaultDisposition, {
            name: game.i18n.localize("Settings.DefaultDisposition"),
            config: true,
            scope: "world",
            type: String,
            choices: { "1": "Friendly", "0": "Neutral", "-1": "Hostile" },
            default: "-1"
        });
        game.settings.register(thisModule, settingDefaultActorType, {
            name: game.i18n.localize("Settings.DefaultActorType"),
            config: true,
            scope: "world",
            type: String,
            choices: { "npc": "NPC", "character": "Character" },
            default: "npc"
        });
        game.settings.register(thisModule, settingDefaultIsWildcard, {
            name: game.i18n.localize("Settings.DefaultIsWildcard"),
            config: true,
            scope: "world",
            type: Boolean,
            default: false
        });
        game.settings.register(thisModule, settingAdditionalTraits, {
            name: game.i18n.localize("Settings.AdditionalTraits"),
            hint: game.i18n.localize("Settings.AdditionalTraitsHint"),
            config: true,
            scope: "world",
            type: String,
            default: getActorAddtionalStats()
        });
        game.settings.register(thisModule, settingBulletPointIcons, {
            name: game.i18n.localize("Settings.BulletPointIcons"),
            hint: game.i18n.localize("BulletPointIconsHint.AdditionalTraitsHint"),
            config: true,
            scope: "world",
            type: String,
            default: '•|'
        });
        game.settings.register(thisModule, settingLastSaveFolder, {
            name: "Set the last save folder",
            config: false,
            scope: "world",
            type: String,            
        });
        game.settings.register(thisModule, settingActiveCompendiums, {
            name: "Compendiums in use by Importer",
            config: false,
            scope: "world",
            type: String
        });
    }
}