import { log } from "./global";

export const ActorImporter = async function (actorDataToImport) {
    let actorId = GetActorId(actorDataToImport.name);

    if (actorId === undefined) {
        await Import(actorDataToImport);
    } else {
        await WhatToDo(actorDataToImport, actorId)    
    }
}

async function WhatToDo(actorData, actorId) {
    let actorExists = `
    <h3>Actor Exists!</h3>
    <p>This actor already exists in your game!</p>
    <p>How would you like to proceed?</p>
    <label for="newName">Import with different name (current name displayed):>
    <input type="text" id="newName" name="newName" value="${actorData.name}">
    `

    new Dialog({
        title: "NPC Importer",
        content: actorExists,
        buttons: {
            Import: {
                label: "Rename",
                callback: () => {
                    actorData.name = document.getElementById("newName").textContent;
                    await Import(actorData);
                },
            },
            Override: {
                label: "Override existing actor",
                callback: () => {
                    await DeleteActor(actorId);
                    await Import(actorData);
                },
            },
            Cancel: {
                label: "Cancel Import"
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
    return game.actors.getName(actorName).data._id;
}

async function DeleteActor(actorId){
    await Actor.delete(actorId);
}

