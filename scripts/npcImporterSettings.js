import { GetAllItemCompendiums, GetAllPackageNames } from "./compendiumActions.js";
import {
    defaultPackage, thisModule, settingPackageToUse, settingAdditionalTraits,
    settingDefaultDisposition, settingDefaultActorType, settingDefaultIsWildcard
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
        game.settings.register(thisModule, settingAdditionalTraits, {
            name: "Additional Traits",
            hint: 'A comma seperated list of custom stats to use, each entry should be followed by a colon (eg. "Sanity:, Strain:")',
            config: true,
            scope: "world",
            type: String,
            default: ''
        });
        game.settings.register(thisModule, settingDefaultDisposition, {
            name: "Set the default disposition",
            config: true,
            scope: "world",
            type: String,
            choices: { "1": "Friendly", "0": "Neutral", "-1": "Hostile" },
            default: "-1"
        });
        game.settings.register(thisModule, settingDefaultActorType, {
            name: "Set the default actor type",
            config: true,
            scope: "world",
            type: String,
            choices: { "npc": "NPC", "character": "Character" },
            default: "npc"
        });
        game.settings.register(thisModule, settingDefaultIsWildcard, {
            name: "Set the default select for 'Wildcard'",
            config: true,
            scope: "world",
            type: Boolean,
            default: true
        });

        // game.settings.registerMenu(thisModule, "compsToUse", {
        //     name: "Compendiums to use",
        //     lable: "Compendiums",
        //     icon: "fas fa-book",
        //     type: CompSelector,
        //     restricted: true,
        // });
    }
}


// class CompSelector extends FormApplication {
//     constructor(object, options = {}) {
//         super(object, options);
//     }
//     static get defaultOptions() {
//         return mergeObject(super.defaultOptions, {
//             id: `${thisModule}.compendiumsToUse`,
//             title: "Compendiums to use",
//             template: `modules/${thisModule}/templates/CompSelector.html`,
//             classes: ["sheet"],
//             width: 350,
//             closeOnSubmit: false,
//         });
//     }

//     getData(){
//         return {
//             comps: GetAllItemCompendiums()
//         };
//     }

//     async _updateObject(event, data){

//     }
// }

