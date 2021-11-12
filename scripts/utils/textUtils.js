
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

export const spcialAbilitiesLink = function (specAbName) {
    var cleanedName = specAbName.split('(')[0].replace(new RegExp('[\\−\\-\\+]?[0-9]'), '').trim();
    return `@Compendium[swade-core-rules.swade-rules.Special Ability (${cleanedName})]{${specAbName}}`;
}

export function removeMultipleWhitespaces(text) {    
    return text.replace(new RegExp(/\s+/g), ' ');
}