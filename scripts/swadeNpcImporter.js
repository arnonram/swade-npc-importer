import { BuildActor } from "./actorBuilder.js";
import { getModuleSettings, log, settingDefaultActorType, settingDefaultDisposition, settingDefaultIsWildcard, thisModule } from "./global.js";
import { NpcImporterSettings } from "./npcImporterSettings.js";


// Hooks.once("init", async () => {});
// Hooks.once("setup", () => {});
Hooks.on("ready", async () => {
    log("Setting up settings...");
    await NpcImporterSettings.register();
});

Hooks.on("renderActorDirectory", async (app, html, data) => {
    const npcImporterButton = $(
        '<button style="min-width: 96%; margin: 10px 6px;"><i class="fas fa-file-import"> Actor Importer</i></button>'
    );
    html.find(".directory-footer").append(npcImporterButton);

    npcImporterButton.click(() => {
        new Dialog({
            title: "NPC Importer",
            content: importerDialogue(),
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


function importerDialogue() {
    let defaultData = {
        actorType: game.settings.get(thisModule, settingDefaultActorType),
        isWildcard: game.settings.get(thisModule, settingDefaultIsWildcard),
        disposition: game.settings.get(thisModule, settingDefaultDisposition)
    };

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
                <input type="radio" id="npc" name="actorType" value="npc" ${is_checked(defaultData.actorType, 'npc')}>
                <label for="NPC">NPC</lable><br>
                <input type="radio" id="character" name="actorType" value="character" ${is_checked(defaultData.actorType, 'character')}>
                <label for="character">Character</lable>
            </div>
            <div class="column"> 
                <p>Wildcard?</p>
                <input type="radio" id="yes" name="isWildcard" value="true" ${is_checked(defaultData.isWildcard, true)}>
                <label for="yes">Yes</lable><br>
                <input type="radio" id="no" name="isWildcard" value="false" ${is_checked(defaultData.isWildcard, false)}>
                <label for="no">No</lable>
            </div>
            <div class="column"> 
                <p>Disposition:</p>
                <input type="radio" id="hostile" name="disposition" value="-1" ${is_checked(defaultData.disposition, '-1')}>
                <label for="hostile">Hostile</lable><br>
                <input type="radio" id="neutral" name="disposition" value="0" ${is_checked(defaultData.disposition, '0')}>
                <label for="neutral">Neutral</lable><br>
                <input type="radio" id="friendly" name="disposition" value="1" ${is_checked(defaultData.disposition, '1')}>
                <label for="friendly">Friendly</lable>
                </div>
            </div>
            `;
    return npcImporterDialog;
}


function is_checked(setValue, html_value) {
    if (setValue == html_value) {
        return "checked";
    }
    else {
        return "";
    }
}