import { getActorAddtionalStatsArray } from "../utils/foundryActions.js";
import {
    settingActiveCompendiums, thisModule, settingPackageToUse, settingAdditionalTraits,
    settingDefaultDisposition, settingDefaultActorType, settingDefaultIsWildcard,
    settingBulletPointIcons, settingLastSaveFolder, settingCompsToUse, settingParaeLanguage,
    settingModifiedSpecialAbs
} from "../global.js";
import SelectCompendiums from "./selectCompendiums.js";

export class NpcImporterSettings {
    static async register() {
        game.settings.registerMenu(thisModule, settingCompsToUse, {
            name: game.i18n.localize("npcImporter.settings.CompendiumsSelector"),
            label: game.i18n.localize("npcImporter.settings.CompendiumsSelector"),
            hint: game.i18n.localize("npcImporter.settings.CompendiumsSelectorHint"),
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

        game.settings.register(thisModule, settingParaeLanguage, {
            name: game.i18n.localize("npcImporter.settings.parseLanguage"),
            hint: game.i18n.localize("npcImporter.settings.parseLanguageHint"),
            config: true,
            scope: "world",
            type: String,
            choices: {
                "en": "English",
                "es": "Español",
                "por": "Português"
            }
        });
        game.settings.register(thisModule, settingDefaultDisposition, {
            name: game.i18n.localize("npcImporter.settings.DefaultDisposition"),
            config: true,
            scope: "world",
            type: String,
            choices: { 
                "1": game.i18n.localize("npcImporter.settings.Friendly"),
                "0": game.i18n.localize("npcImporter.settings.Neutral"),
                "-1": game.i18n.localize("npcImporter.settings.Hostile") 
            },
            default: "-1"
        });
        game.settings.register(thisModule, settingDefaultActorType, {
            name: game.i18n.localize("npcImporter.settings.DefaultActorType"),
            config: true,
            scope: "world",
            type: String,
            choices: {
                "npc": game.i18n.localize("npcImporter.settings.NPC"),
                "character": game.i18n.localize("npcImporter.settings.Character")
            },
            default: "npc"
        });
        game.settings.register(thisModule, settingDefaultIsWildcard, {
            name: game.i18n.localize("npcImporter.settings.DefaultIsWildcard"),
            config: true,
            scope: "world",
            type: Boolean,
            default: false
        });
        game.settings.register(thisModule, settingAdditionalTraits, {
            name: game.i18n.localize("npcImporter.settings.AdditionalTraits"),
            hint: game.i18n.localize("npcImporter.settings.AdditionalTraitsHint"),
            config: true,
            scope: "world",
            type: String,
            default: getActorAddtionalStatsArray()
        });
        game.settings.register(thisModule, settingBulletPointIcons, {
            name: game.i18n.localize("npcImporter.settings.BulletPointIcons"),
            hint: game.i18n.localize("npcImporter.settings.BulletPointIconsHint"),
            config: true,
            scope: "world",
            type: String,
            default: '•|'
        });
        game.settings.register(thisModule, settingModifiedSpecialAbs, {
            name: game.i18n.localize("npcImporter.settings.ModifiedSpecialAbilities"),
            hint: game.i18n.localize("npcImporter.settings.ModifiedSpecialAbilitiesHint"),
            config: true,
            scope: "world",
            type: Boolean,
            default: false
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
