import { GetAllItemCompendiums, GetAllPackageNames } from "./compendiumActions.js";
import { defaultPackage, thisModule, settingPackageToUse } from "./global.js";

export class NpcImporterSettings {
    static async register(){
        game.settings.register(thisModule, settingPackageToUse, {
            name: "Package for imports",
            hint: "Selecting a package will search through all its' Item compendiums for the correct item from the NPC statblock, and use it",
            config: true,
            scope: "world",
            type: String,
            choices: GetAllPackageNames(),
            default: defaultPackage,
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

