import { ArmorBuilder, WeaponBuilder } from "./itemBuilder.js";
import { diceRegex, meleeDamageRegex, GetMeleeDamage, GetArmorBonus } from "../global.js";

export const SpecialAbilitiesParser = async function (specialAbilitiesData) {
    let specialAbitlitiesItems = [];
    for (const elem in specialAbilitiesData) {
        if (elem.toLocaleLowerCase().startsWith("armor")) {
            let armorBonus = GetArmorBonus(elem);
            specialAbitlitiesItems.push(await ArmorBuilder(elem, armorBonus, specialAbilitiesData[elem]))
        }
        if (specialAbilitiesData[elem].match(meleeDamageRegex)){
            let meleeDamage = GetMeleeDamage(specialAbilitiesData[elem]);
            specialAbitlitiesItems.push(await WeaponBuilder(elem, specialAbilitiesData[elem], meleeDamage));
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
    let html = `<h4>Special Abilities</h4><ul>`
    text.forEach(element => {
        let die = element.match(diceRegex)
        if (die != null){
            element = element.replace(die[0], `[[/r ${die}]]`);
        }
        html = html.concat(`<li>${element}</li>`);
    });
    html.concat(`</ul>`)
    return html;
}
