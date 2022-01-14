export function capitalize(string) {
  return string.replace(/(?:^|\s)\S/g, function (a) {
    return a.toUpperCase();
  });
}

export function capitalizeEveryWord(string) {
  let capitalizedString = [];
  string.split(' ').forEach(x => {
    capitalizedString.push(capitalize(x.toLowerCase()));
  });

  return capitalizedString
    .join(' ')
    .replace(/[\-\()][a-z]| [a-z]/g, match => match.toUpperCase());
}

export function spcialAbilitiesLink(specAbName) {
  var cleanedName = specAbName
    .split('(')[0]
    .replace(new RegExp('[\\−\\-\\+]?[0-9]'), '')
    .trim();
  return `@Compendium[swade-core-rules.swade-rules.Special Ability (${cleanedName})]{${specAbName}}`;
}

export function removeMultipleWhitespaces(text) {
  return text.replace(new RegExp(/\s+/g), ' ');
}

export function splitAndSort(text) {
  return JSON.stringify(
    text
      .split(/[\s,]+/)
      .map(x => x.toLowerCase().trim())
      .sort()
  );
}
