import { log } from "./global.js";

export const ActorImporter = async function (actorDataToImport) {
    let actorId = GetActorId(actorDataToImport.name);
    log(`actorId: ${actorId}`)
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

async function Import(actorData) {
    try {
        await Actor.create(actorData);
        ui.notifications.info(`${actorData.name} created successfully`)
    } catch (error) {
        log(`Failed to import: ${error}`)
        ui.notifications.error("Failed to import actor (see console for errors)")
    }
}

function GetActorId(actorName) {
    try {        
        return game.actors.getName(actorName).data._id;
    } catch (error) {
        log(`Actor not found`);
        return false;
    }
}

async function DeleteActor(actorId) {
    try {
        await Actor.delete(actorId);
        ui.notifications.info(`Delete Actor with id ${actorId}`)    
    } catch (error) {
        log(`Failed to delet actor: ${error}`)
    }    
}

