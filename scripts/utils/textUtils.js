import * as global from '../global.js';

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
  try {
    return game.packs
      .get('swade-core-rules.swade-specialabilities')
      .contents.filter(x => x.name.includes(cleanedName))[0].link;
  } catch (error) {
    return '';
  }
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

export function splitAndTrim(stringToSplit, separator) {
  return stringToSplit.split(separator).map(function (item) {
    return item.replace(global.newLineRegex, ' ').trim();
  });
}
