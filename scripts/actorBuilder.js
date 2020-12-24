import { log, settingLastSaveFolder, settingParaeLanguage } from "./global.js"
import { StatBlockParser } from "./parseStatBlock.js";
import { ActorImporter } from "./actorImporter.js";
import { BuildActorData} from "./dataBuilders/buildActorData.js";
import { BuildActorItems} from "./dataBuilders/buildActorItems.js";
import { BuildActorToken } from "./dataBuilders/buildActorToken.js";
import { getFolderId, updateModuleSetting, setParsingLanguage, getModuleSettings } from "./utils/foundryActions.js";

export const BuildActor = async function (actorType, isWildCard, disposition, saveFolder ,data = undefined) {
    let clipboardText = data ?? await GetClipboardText();
    if (clipboardText != undefined) {
        let currentLang = game.i18n.lang;
        await setParsingLanguage(getModuleSettings(settingParaeLanguage));
        let parsedData = await StatBlockParser(clipboardText);
        if (parsedData != undefined) {
            try {
                var finalActor = {}
                finalActor.name = parsedData.Name;
                finalActor.type = actorType;
                finalActor.folder = saveFolder == '' ? '' : getFolderId(saveFolder) ;
                finalActor.data = await BuildActorData(parsedData, isWildCard == 'true');
                finalActor.items = await BuildActorItems(parsedData);
                finalActor.token = await BuildActorToken(parsedData, disposition);            
                
                await updateModuleSetting(settingLastSaveFolder, saveFolder);
                await setParsingLanguage(currentLang);
                log(`Actor to import: ${JSON.stringify(finalActor)}`);
                await ActorImporter(finalActor);
            } catch (error) {
                log("Failed to build finalActor: " + error);
            } finally {
                await setParsingLanguage(currentLang);
            }
        }
    } else {
        ui.notification.error(game.i18n.localize("npcImporter.parser.EmptyClipboard"))
    }
}

async function GetClipboardText() {
    return await navigator.clipboard.readText();
}