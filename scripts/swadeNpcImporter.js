import { BuildActor } from "./actorBuilder.js"
import { log } from "./global.js";

Hooks.once("init", async () => {
    log("Starting NPC Importer");
});
Hooks.once("setup", () => {});
Hooks.once("ready", async () => {
  //game.packs isn't ready til ready
  log("Initalizing SWADE NPC Importer...");
//   await Settings.registerSettings();
  log("NPC Importer Initialized!");
});

Hooks.on("renderActorDirectory", (app, html, data) => {
    const npcImporterButton = $(
        '<button style="min-width: 96%; margin: 10px 6px;">Actor Importer</button>'
    );
    html.find(".directory-footer").append(npcImporterButton);

    const npcImporterDialog = `
        <h3>Actor Importer</h3>
        <p>Imports stats block from clipboard</p>
        <div style="width: 100%; display: table;">
            <div style="width: 50%; height: 100px; float: left"> 
                <p>Actor Type:</p>
                <input type="radio" id="npc" name="actorType" value="npc" checked="checked">
                <label for="NPC">NPC</lable><br>
                <input type="radio" id="character" name="actorType" value="character">
                <label for="character">Character</lable><br>
            </div>
            <div style="margin-left: 50%; height: 100px;"> 
                <p>Wildcard?</p>
                <input type="radio" id="yes" name="isWildcard" value="true">
                <label for="yes">Yes</lable><br>
                <input type="radio" id="no" name="isWildcard" value="false" checked="checked">
                <label for="no">No</lable><br>
            </div>
        </div>
    `
    npcImporterButton.click((ev) => {
        log("NPC Importer button clicked");
        new Dialog({
            title: "Import NPC",
            content:  npcImporterDialog,
            buttons: {
                Import: {
                    label: "Import!",
                    callback: (html) => {
                        await BuildActor(
                            html.find("#actorType")[0].value,
                            html.find("#isWildcard")[0].value);
                    },
                },
                Cancel: {
                    label: "Cancel"
                },
            },
            Default: "Import!",
        }).render(true);
    });
});
