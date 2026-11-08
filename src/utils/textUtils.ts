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
    .replace(/[-()][a-z]| [a-z]/g, match => match.toUpperCase());
}

export function specialAbilitiesLink(specAbName: string): string | null {
  const cleanedName = specAbName
    .split('(')[0]
    .replace(/[−\-+]? [0-9]/, '')
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

/**
 * True when an item name and a SWADE swid refer to the same item.
 * SWADE builds slash names inconsistently ("Boost/Lower Trait" -> "boostlower-trait",
 * "Light / Darkness" -> "light-darkness"), so also compare with all separators removed.
 */
export function matchesSwid(name: string, swid: string): boolean {
  const compact = (s: string) => s.toLowerCase().replace(/[^\p{L}\p{N}]/gu, '');
  return (
    swidLookupKey(name) === swidLookupKey(swid) ||
    compact(name) === compact(swid)
  );
}

/**
 * Names covered by a combined "A/B" item, so a stat block naming only one half can match it.
 * "Boost/Lower Trait" -> ["Boost Trait", "Lower Trait"]; "Light / Darkness" -> ["Light", "Darkness"].
 */
export function slashNameVariants(name: string): string[] {
  if (!name.includes('/')) return [];
  const parts = name.split(/\s*\/\s*/).map(p => p.trim());
  const lastWords = parts[parts.length - 1].split(/\s+/);
  const sharedSuffix =
    lastWords.length > 1 && parts.slice(0, -1).every(p => !p.includes(' '))
      ? lastWords.slice(1).join(' ')
      : '';
  return parts.map((p, i) =>
    sharedSuffix && i < parts.length - 1 ? `${p} ${sharedSuffix}` : p,
  );
}

/**
 * Undoes line-break artifacts from text copied out of a PDF:
 * soft hyphens, words hyphenated across lines ("Fleet-\nFooted"), and "boost/\nlower".
 */
export function joinBrokenLines(text: string): string {
  return text
    .replace(/\u00ad\s*/g, '')
    .replace(/(\p{L})-[ \t]*\r?\n[ \t]*(?=\p{L})/gu, '$1-')
    .replace(/\/[ \t]*\r?\n[ \t]*/g, '/');
}

export function splitAndTrim(
  stringToSplit: string,
  separator: string | RegExp,
): string[] {
  const arr = stringToSplit
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
