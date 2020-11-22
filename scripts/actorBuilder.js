import { log } from "./global.js"
import { StatBlockParser } from "./parseStatBlock.js";
import { ActorImporter } from "./actorImporter.js";
import { BuildActorData} from "./dataBuilders/buildActorData.js";
import { BuildActorItems} from "./dataBuilders/buildActorItems.js";
import { BuildActorToken } from "./dataBuilders/buildActorToken.js";

export const BuildActor = async function (actorType, isWildCard, disposition, data) {
    log(`BuildActor initiated: actorType=${actorType}, isWildCard=${isWildCard}, disposition=${disposition}`)
    let clipboardText = data ?? await GetClipboardText();
    if (clipboardText != undefined) {
        let parsedData = await StatBlockParser(clipboardText);
        if (parsedData != undefined) {
            var finalActor = {}
            finalActor.name = parsedData.Name;
            finalActor.type = actorType;
            finalActor.data = await BuildActorData(parsedData, isWildCard == 'true');
            finalActor.items = await BuildActorItems(parsedData);
            finalActor.token = await BuildActorToken(parsedData, disposition);

            log(`Actor to import: ${JSON.stringify(finalActor)}`);
            await ActorImporter(finalActor);
        }
    } else {
        ui.notification.error("Clipboard empty")
    }
}

async function GetClipboardText() {
    log("Reading clipboard data...");
    return await navigator.clipboard.readText();
}