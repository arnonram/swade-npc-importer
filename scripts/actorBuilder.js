import { log, settingLastSaveFolder } from "./global.js"
import { StatBlockParser } from "./parseStatBlock.js";
import { ActorImporter } from "./actorImporter.js";
import { BuildActorData} from "./dataBuilders/buildActorData.js";
import { BuildActorItems} from "./dataBuilders/buildActorItems.js";
import { BuildActorToken } from "./dataBuilders/buildActorToken.js";
import { getFolderId, updateModuleSetting } from "./utils/foundryActions.js";

export const BuildActor = async function (actorType, isWildCard, disposition, saveFolder ,data = undefined) {
    log(`BuildActor initiated: actorType=${actorType}, isWildCard=${isWildCard}, disposition=${disposition}, saveFolder=${saveFolder}`)
    let clipboardText = data ?? await GetClipboardText();
    if (clipboardText != undefined) {
        let parsedData = await StatBlockParser(clipboardText);
        if (parsedData != undefined) {
            var finalActor = {}
            finalActor.name = parsedData.Name;
            finalActor.type = actorType;
            finalActor.folder = saveFolder == '' ? '' : getFolderId(saveFolder) ;
            finalActor.data = await BuildActorData(parsedData, isWildCard == 'true');
            finalActor.items = await BuildActorItems(parsedData);
            finalActor.token = await BuildActorToken(parsedData, disposition);            
            
            await updateModuleSetting(settingLastSaveFolder, saveFolder)
            log(`Actor to import: ${JSON.stringify(finalActor)}`);
            await ActorImporter(finalActor);
        }
    } else {
        ui.notification.error(game.i18n.localize("Parser.EmptyClipboard"))
    }
}

async function GetClipboardText() {
    return await navigator.clipboard.readText();
}