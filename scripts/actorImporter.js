import { log } from "./global.js";
import { Import, GetActorId, DeleteActor } from "./foundryActions.js";

export const ActorImporter = async function (actorDataToImport) {
    let actorId = GetActorId(actorDataToImport.name);
    if (actorId == false) {
        await Import(actorDataToImport);
    } else {
        await WhatToDo(actorDataToImport, actorId);
    }
}

async function WhatToDo(actorData, actorId) {
    let actorExists = `
    <h3>Actor Exists!</h3>
    <p>This actor already exists in your game!</p>
    <p>How would you like to proceed?</p>
    <div class="form-group-dialog newName" >
        <label for="newName">Import with different name (current name displayed):</label>
        <input type="text" id="newName" name="newName" value="${actorData.name}">
    </dev>
    `

    new Dialog({
        title: "NPC Importer",
        content: actorExists,
        buttons: {
            Import: {
                label: "Rename",
                callback: async () => {
                    let newName = document.querySelector("#newName").value;
                    log(`Import with new name: ${newName}`);
                    actorData.name = newName;
                    await Import(actorData);
                },
            },
            Override: {
                label: "Override",
                callback: async () => {
                    log("Overriding existing Actor")
                    await DeleteActor(actorId);
                    await Import(actorData);
                },
            },
            Cancel: {
                label: "Cancel",
                callback: () => {
                    ui.notifications.info("Actor not imported by user request");
                },
            },
        },
    }).render(true);
}


