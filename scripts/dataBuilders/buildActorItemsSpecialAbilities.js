import { ArmorBuilder, WeaponBuilder } from "./itemBuilder.js";
import { diceRegex, meleeDamageRegex } from "../global.js";
import { GetArmorBonus } from "../utils/parserBuilderHelpers.js";

export const SpecialAbilitiesParser = async function (specialAbilitiesData) {
    let specialAbitlitiesItems = [];
    for (const elem in specialAbilitiesData) {
        if (elem.toLocaleLowerCase().startsWith(game.i18n.localize("Parser.Armor").toLocaleLowerCase())) {
            let armorBonus = GetArmorBonus(elem);
            specialAbitlitiesItems.push(await ArmorBuilder(elem, armorBonus, specialAbilitiesData[elem]))
        }
        if (meleeDamageRegex.test(specialAbilitiesData[elem]) || diceRegex.test(specialAbilitiesData[elem])) {
            let meleeDamage = specialAbilitiesData[elem].match(meleeDamageRegex) || specialAbilitiesData[elem].match(diceRegex);
            specialAbitlitiesItems.push(await WeaponBuilder(elem, specialAbilitiesData[elem], meleeDamage[0]));
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
    let html = `<hr><h3><strong>${game.i18n.localize("Parser.SpecialAbilities")}</strong></h3><ul>`
    text.forEach(element => {
        html = html.concat(`<li>${element}</li>`);
    });
    html.concat(`</ul>`)
    return html;
}
