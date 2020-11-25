import { BuildActor } from "./actorBuilder.js";
import { log, settingDefaultActorType, settingDefaultDisposition, settingDefaultIsWildcard, settingLastSaveFolder } from "./global.js";
import { NpcImporterSettings } from "./npcImporterSettings.js";
import { getModuleSettings, getAllActorFolders } from "./foundryActions.js";

// Hooks.once("init", async () => {});
// Hooks.once("setup", () => {});
Hooks.on("ready", async () => {
    log("Setting up settings...");
    await NpcImporterSettings.register();
});

Hooks.on("renderActorDirectory", async (app, html, data) => {
    const npcImporterButton = $(
        '<button style="min-width: 90%; margin: 10px 6px;"><i class="fas fa-file-import"> Actor Importer</i></button>'
    );
    html.find(".directory-footer").append(npcImporterButton);

    npcImporterButton.click(() => {
        new Dialog({
            title: "NPC Importer",
            content: importerDialogue(),
            buttons: {
                Import: {
                    label: "Import!",
                    callback: (html) => {
                        let radios = document.querySelectorAll('input[type="radio"]:checked');
                        BuildActor(
                            radios[0].value,
                            radios[1].value,
                            parseInt(radios[2].value),
                            html.find('select[name="save-folder"]')[0].value);
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
        actorType: getModuleSettings(settingDefaultActorType),
        isWildcard: getModuleSettings(settingDefaultIsWildcard),
        disposition: getModuleSettings(settingDefaultDisposition)
    };

    let folderOptions = buildFolderOptions();

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
            <div class="row">
                <label>Save in folder...</label>
                <select name="save-folder">${folderOptions}</select>
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

function buildFolderOptions() {
    let lastSave = getModuleSettings(settingLastSaveFolder);
    let folders = getAllActorFolders();
    let folderOptions = `<option value='' ${isLastSavedFolder(lastSave, '')}>--</option>`;
    folders.forEach(folder => {
        folderOptions += `<option value="${folder.trim()}" ${isLastSavedFolder(lastSave, folder.trim())}>${folder.trim()}</option>`
    });
    return folderOptions;
}

function isLastSavedFolder(lastFolder, folderName) {
    if (lastFolder != undefined && lastFolder === folderName) {
        return 'selected';
    } else {
        return '';
    }
}