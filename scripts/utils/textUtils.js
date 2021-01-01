
export const capitalize = function (string) {
    return string.replace(/(?:^|\s)\S/g, function (a) {
        return a.toUpperCase();
    });
};

export const capitalizeEveryWord = function (string) {
    let capitalizedString = [];
    string.split(' ').forEach(x => {
        capitalizedString.push(capitalize(x.toLowerCase()));
    });

    return capitalizedString.join(' ').replace(/[\-\()][a-z]| [a-z]/g, match => match.toUpperCase());
};

export const SpecialAbilitiesForDescription = function (specialAbilitiesData) {
    let textForDescription = [];
    for (const elem in specialAbilitiesData) {
        var item = elem.replace(new RegExp('^@[aehw]?'), '').trim();

        if (item != game.i18n.localize("npcImporter.parser.Speed")){
            if (game.packs.get('swade-core-rules.swade-rules') != undefined) {
                var cleanedItem = item.split('(')[0].replace(new RegExp('[\\−\\-\\+]?[0-9]'), '').trim();
            textForDescription.push(`&commat;Compendium[swade-core-rules.swade-rules.Special Ability (${cleanedItem})]{${item}}: ${specialAbilitiesData[elem]}`)
            }
        } else {
            textForDescription.push(`<b>${item}:</b> ${specialAbilitiesData[item]}`)
        }        
    }

    return CreateHtmlList(textForDescription);
}

function CreateHtmlList(text) {
    let html = `<h3><strong>${game.i18n.localize("npcImporter.parser.SpecialAbilities")}</strong></h3><ul>`
    text.forEach(element => {
        html = html.concat(`<li>${element.replace(new RegExp('@([aehw])?'), '').trim()}</li>`);
    });
    html.concat(`</ul>`)
    return html;
}
