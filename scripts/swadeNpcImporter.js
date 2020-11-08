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

Hooks.on("renderActorDirectory", async (app, html, data) => {
    const npcImporterButton = $(
        '<button style="min-width: 96%; margin: 10px 6px;">Actor Importer</button>'
    );
    html.find(".directory-footer").append(npcImporterButton);

    let npcImporterDialog = `
        <head>
            <style>
                * {
                box-sizing: border-box;
                }

                .column {
                    float: left;
                    width: 33.33%;
                    padding: 3px;
                    height: 100px;
                }

                /* Clear floats after the columns */
                .row:after {
                    content: "";
                    display: table;
                    clear: both;
                }
            </style>
        </head>
        <body>
        <h3>Actor Importer</h3>
        <p>Imports stats block from clipboard</p>
        <div class = "row">
            <div class="column"> 
                <p>Actor Type:</p>
                <input type="radio" id="npc" name="actorType" value="npc" checked="checked">
                <label for="NPC">NPC</lable><br>
                <input type="radio" id="character" name="actorType" value="character">
                <label for="character">Character</lable>
            </div>
            <div class="column"> 
                <p>Wildcard?</p>
                <input type="radio" id="yes" name="isWildcard" value="true">
                <label for="yes">Yes</lable><br>
                <input type="radio" id="no" name="isWildcard" value="false" checked="checked">
                <label for="no">No</lable>
            </div>
            <div class="column"> 
                <p>Disposition:</p>
                <input type="radio" id="hostile" name="disposition" value="-1">
                <label for="hostile">Hostile</lable><br>
                <input type="radio" id="neutral" name="disposition" value="0" checked="checked">
                <label for="neutral">Neutral</lable><br>
                <input type="radio" id="friendly" name="disposition" value="1">
                <label for="friendly">Friendly</lable>
                </div>
            </div>
            `;
            
    npcImporterButton.click(() => {
        new Dialog({
            title: "NPC Importer",
            content:  npcImporterDialog,
            buttons: {
                Import: {
                    label: "Import!",
                    callback: () => {
                        let radios = document.querySelectorAll('input[type="radio"]:checked');
                        BuildActor(
                            radios[0].value,
                            radios[1].value,
                            parseInt(radios[2].value));
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