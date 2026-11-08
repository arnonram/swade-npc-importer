import { newLineRegex } from '../global';
import { Logger } from './logger';

export function capitalize(input: string): string {
  return input.replace(/(?:^|\s)\S/g, a => a.toUpperCase());
}

export function capitalizeEveryWord(input: string): string {
  return input
    .split(' ')
    .map(word => capitalize(word.toLowerCase()))
    .join(' ')
    .replace(/[\-\()][a-z]| [a-z]/g, match => match.toUpperCase());
}

export function specialAbilitiesLink(specAbName: string): string | null {
  const cleanedName = specAbName
    .split('(')[0]
    .replace(/[\−\-+]? [0-9]/, '')
    .trim();
  try {
    // Use the index: pack.contents only holds documents already loaded.
    const entry = game.packs
      ?.get('swade-core-rules.swade-specialabilities')
      ?.index.find(x => !!x.name?.includes(cleanedName));
    return entry ? `@UUID[${entry.uuid}]{${entry.name}}` : '';
  } catch (error) {
    Logger.error(
      `Error finding special ability link for "${cleanedName}":`,
      error,
    );
    return '';
  }
}

export const removeMultipleWhitespaces = (text: string): string =>
  text.replace(/\s+/g, ' ');

/**
 * Normalizes an item name or SWADE swid into a comparable key:
 * lowercase, punctuation dropped (as SWADE does when building swids),
 * words sorted so word order does not matter.
 * e.g. "Holy/Unholy Warrior" and "holyunholy-warrior" give the same key.
 */
export function swidLookupKey(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, '')
    .split(/[\s-]+/)
    .filter(Boolean)
    .sort()
    .join('-');
}

export function splitAndTrim(
  stringToSplit: string,
  separator: string | RegExp,
): string[] {
  let arr = stringToSplit
    .split(separator)
    .map(item => item.replace(newLineRegex, ' ').trim())
    .filter(item => item.length > 0);
  return removeEmptyArrayProp(arr);
}

export function lowerCaseShishKebab(string: string): string {
  return string
    .split(/[\s,]+/)[0]
    .toLowerCase()
    .replaceAll(' ', '-');
}

export function removeEmptyArrayProp(arr: string[]): string[] {
  return arr.filter(str => /[a-zA-Z]/.test(str));
}

export const cleanKeyName = (key: string) =>
  key
    .replace(/^@([aehw]|sa)/, '')
    .toLowerCase()
    .trim();
