import { BuildActor } from "./actorBuilder.js";

Hooks.on("renderActorDirectory", (app, html, data) => {
    const importStatblockButton = $(
        '<button style="min-width: 96%; margin: 10px 6px;">Actor Importer</button>'
    );
    html.find(".directory-footer").append(importButton);

    const importWindowDialogue = `
        <h3>Actor Importer</h3>
        <p>Imports stats block from clipboard</p>
        <form>
            <p>Actor Type:</p>
            <input type="radio" id="npc" name="actorType" value="npc">
            <label for="NPC">NPC</lable><br>
            <input type="radio" id="character" name="actorType" value="character">
            <label for="character">Character</lable><br>
            <br>
            <p>Wildcard?</p>
            <input type="radio" id="yes" name="isWildcar" value="true">
            <label for="yes">Yes</lable><br>
            <input type="radio" id="no" name="isWildcar" value="false">
            <label for="no">No</lable><br>
        </form>
    `
    importStatblockButton.click((ev) => {
        logger("Starting Actor Import");
        new Dialog({
            title: "Import Statblock",
            content: "../tempaltes/ImportWindowDialogue.html",
            buttons: {
                Import: {
                    label: "Import!",
                    callback: (html) => {
                        BuildActor(
                            html.find("#actorType")[0].value,
                            html.find("#isWildcard")[0].value);
                    },
                },
                Cancel: {
                    label: "Cancel"
                },
            },
        }).render(true);
    });
});
