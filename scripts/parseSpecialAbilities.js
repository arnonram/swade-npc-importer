import { ArmorBuilder, WeaponBuilder } from "./itemBuilder.js";
import { diceRegex } from "./global.js";

export const SpecialAbilitiesParser = async function (specialAbilitiesData) {
    let specialAbitlitiesItems = {};

    Object.entries(specialAbilitiesData).forEach(([ability, description]) => {
        if (ability.toLocaleLowerCase().startsWith("armor")) {
            specialAbitlitiesItems.push(ArmorBuilder())
        }
        if (description.toLocaleLowerCase.includes("str+")){
            let damage = description.match(diceRegex)[0].toString();
            specialAbitlitiesItems.push(WeaponBuilder(ability, damage, description));
        }
    });

    return specialAbitlitiesItems;
}


export const SpecialAbilitiesForDescription = function (specialAbilitiesData) {
    let textForDescription = [];
    Object.entries(specialAbilitiesData).forEach(([ability, description]) => {
        textForDescription.push(`<b>${ability}:</b> ${description}`)
    });

    return CreateHtmlList(textForDescription);
}

function CreateHtmlList(text) {
    let html = `<h4>Special Abilities</h4><ul>`
    text.forEach(element => {
        html.concat(`<li>${element}</li>`)
    });
    html.concat(`</ul>`)
}