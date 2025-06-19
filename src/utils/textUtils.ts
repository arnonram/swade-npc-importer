import { newLineRegex } from '../global';

export function capitalize(string: string): string {
  return string.replace(/(?:^|\s)\S/g, function (a) {
    return a.toUpperCase();
  });
}

export function capitalizeEveryWord(string: string): string {
  let capitalizedString: string[] = [];
  string.split(' ').forEach(x => {
    capitalizedString.push(capitalize(x.toLowerCase()));
  });

  return capitalizedString
    .join(' ')
    .replace(/[\-\()][a-z]| [a-z]/g, match => match.toUpperCase());
}

export function specialAbilitiesLink(specAbName: string): string {
  var cleanedName = specAbName
    .split('(')[0]
    .replace(new RegExp('[\\−\\-\\+]? [0-9]'), '')
    .trim();
  try {
    // @ts-ignore: game is a global from Foundry VTT
    return game.packs
      .get('swade-core-rules.swade-specialabilities')
      .contents.filter((x: any) => x.name.includes(cleanedName))[0].link;
  } catch (error) {
    return '';
  }
}

export function removeMultipleWhitespaces(text: string): string {
  return text.replace(new RegExp(/\s+/g), ' ');
}

export function splitAndSort(text: string): string {
  return JSON.stringify(
    text
      .split(/[\s,]+/)
      .map(x => x.toLowerCase().trim())
      .sort(),
  );
}

export function splitAndTrim(
  stringToSplit: string,
  separator: string | RegExp,
): string[] {
  return stringToSplit
    .split(separator)
    .map(function (item) {
      return item.replace(newLineRegex, ' ').trim();
    })
    .filter(item => item !== '');
}
