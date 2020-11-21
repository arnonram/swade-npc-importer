import { getAllActorFolders, GetAllPackageNames } from "./foundryActions.js";
import {
    defaultPackage, thisModule, settingPackageToUse, settingAdditionalTraits,
    settingDefaultDisposition, settingDefaultActorType, settingDefaultIsWildcard,
    settingBulletPointIcons, settingDefaultSaveFolder
} from "./global.js";

export class NpcImporterSettings {
    static async register() {
        game.settings.register(thisModule, settingPackageToUse, {
            name: "Package for imports",
            hint: "Selecting a package will search through all its' Item compendiums for the correct item from the NPC statblock, and use it",
            config: true,
            scope: "world",
            type: String,
            choices: GetAllPackageNames(),
            default: defaultPackage,
        });
        game.settings.register(thisModule, settingDefaultSaveFolder, {
            name: "Set the default save folder",
            config: true,
            scope: "world",
            type: String,
            choices: getAllActorFolders()
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
            default: ''
        });
        game.settings.register(thisModule, settingBulletPointIcons, {
            name: "Bullet point icons",
            hint: "Paste here the bullet-point icon(s) used by the statblock, seperated by a pipe '|'.\nFor example: •||\\*  (Special character mmust be escaped with a \\, such as: \\*",
            config: true,
            scope: "world",
            type: String,
            default: '•|'
        });
    }
}
