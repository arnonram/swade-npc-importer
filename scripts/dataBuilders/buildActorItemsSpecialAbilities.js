import { ArmorBuilder, ItemBuilderFromSpecAbs, WeaponBuilder } from "./itemBuilder.js";
import { diceRegex, settingModifiedSpecialAbs } from "../global.js";
import { GetArmorBonus } from "../utils/parserBuilderHelpers.js";
import { getModuleSettings } from "../utils/foundryActions.js";

export const SpecialAbilitiesParser = async function (specialAbilitiesData) {
    const meleeDamageRegex = 
        new RegExp(`${game.i18n.localize("npcImporter.parser.Str")}\\.|${game.i18n.localize("npcImporter.parser.Str")}(\\s?[\\+\\-]?\\s?(\\d+)?d?(\\d+)?){0,}`, "gi")
        let specialAbitlitiesItems = [];
    if (!getModuleSettings(settingModifiedSpecialAbs)){        
        for (const elem in specialAbilitiesData) {
            if (elem.toLocaleLowerCase().startsWith(game.i18n.localize("npcImporter.parser.Armor").toLocaleLowerCase())) {
                let armorBonus = GetArmorBonus(elem);
                specialAbitlitiesItems.push(await ArmorBuilder(elem, armorBonus, specialAbilitiesData[elem]))
            }
            if ((meleeDamageRegex.test(specialAbilitiesData[elem]) || diceRegex.test(specialAbilitiesData[elem]))
                && elem.toLocaleLowerCase() != game.i18n.localize("npcImporter.parser.Speed").toLocaleLowerCase()) {
                let meleeDamage = specialAbilitiesData[elem].match(meleeDamageRegex) || specialAbilitiesData[elem].match(diceRegex);
                specialAbitlitiesItems.push(await WeaponBuilder(elem, specialAbilitiesData[elem], meleeDamage[0]));
            }
        }        
    } else {
        for (const elem in specialAbilitiesData) {
            if(elem.startsWith('@w')){
                let meleeDamage = specialAbilitiesData[elem].match(meleeDamageRegex) || specialAbilitiesData[elem].match(diceRegex);
                let name = elem.replace('@w', '').trim();
                specialAbitlitiesItems.push(await WeaponBuilder(name, specialAbilitiesData[elem], meleeDamage[0]));
            } else if (elem.startsWith('@a')){
                let armorBonus = GetArmorBonus(elem);
                let name = elem.replace('@a', '').trim();
                specialAbitlitiesItems.push(await ArmorBuilder(name, armorBonus, specialAbilitiesData[elem]))
            } else if (elem.startsWith('@e')){
                let data = [elem.replace('@e', '').trim(), specialAbilitiesData[elem]]
                specialAbitlitiesItems.push(await ItemBuilderFromSpecAbs(data[0], data[1], "edge"));
            } else if (elem.startsWith('@h')){
                let data = [elem.replace('@h', '').trim(), specialAbilitiesData[elem]]
                specialAbitlitiesItems.push(await ItemBuilderFromSpecAbs(data[0], data[1], "hindrance"));
            } 
        }
    }

    return specialAbitlitiesItems;
}


export const SpecialAbilitiesForDescription = function (specialAbilitiesData) {
    let textForDescription = [];
    for (const elem in specialAbilitiesData) {
        textForDescription.push(`<b>${elem}:</b> ${specialAbilitiesData[elem]}`)
    }

    return CreateHtmlList(textForDescription);
}

function CreateHtmlList(text) {
    let html = `<hr><h3><strong>${game.i18n.localize("npcImporter.parser.SpecialAbilities")}</strong></h3><ul>`
    text.forEach(element => {
        html = html.concat(`<li>${element.replace(new RegExp('@([aehw])?'), '').trim()}</li>`);
    });
    html.concat(`</ul>`)
    return html;
}
