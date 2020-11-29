import { getActorAddtionalStats, getAllActiveCompendiums } from "./foundryActions.js";
import {log,
    settingActiveCompendiums, thisModule, settingPackageToUse, settingAdditionalTraits,
    settingDefaultDisposition, settingDefaultActorType, settingDefaultIsWildcard,
    settingBulletPointIcons, settingLastSaveFolder, settingCompsToUse
} from "./global.js";
import SelectCompendiums from "./selectCompendiums.js";

export class NpcImporterSettings {
    static async register() {
        game.settings.registerMenu(thisModule, settingCompsToUse, {
            name: "Select Item Compendiums",
            label: "Select Item Compendiums",
            hint: "Allows for selecting individual compendiums for the Importer to search through",
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
            name: "Set the default save",
            config: true,
            scope: "world",
            type: String,
            choices: { "1": "Friendly", "0": "Neutral", "-1": "Hostile" },
            default: "-1"
        });
        game.settings.register(thisModule, settingDefaultActorType, {
            name: "Set the default Actor Type",
            config: true,
            scope: "world",
            type: String,
            choices: { "npc": "NPC", "character": "Character" },
            default: "npc"
        });
        game.settings.register(thisModule, settingDefaultIsWildcard, {
            name: "Set the default for Wildcard",
            config: true,
            scope: "world",
            type: Boolean,
            default: false
        });
        game.settings.register(thisModule, settingAdditionalTraits, {
            name: "Additional Traits",
            hint: 'A comma seperated list of custom stats to use, each entry should be followed by a colon (eg. "Sanity:, Strain:")\nThe SWADE System actor additional stats are added by default',
            config: true,
            scope: "world",
            type: String,
            default: getActorAddtionalStats()
        });
        game.settings.register(thisModule, settingBulletPointIcons, {
            name: "Bullet point icons",
            hint: "Paste here the bullet-point icon(s) used by the statblock, seperated by a pipe '|'.\nFor example: •||\\*  (Special character mmust be escaped with a \\, such as: \\*",
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
