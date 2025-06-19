import { newLineRegex } from '../global';

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
    return (
      game.packs
        ?.get('swade-core-rules.swade-specialabilities')
        ?.contents.find((x: any) => x.name.includes(cleanedName))?.link || null
    );
  } catch (error) {
    return null;
  }
}

export const removeMultipleWhitespaces = (text: string): string =>
  text.replace(/\s+/g, ' ');

export function splitAndSort(text: string): string[] {
  return text
    .split(/[\s,]+/)
    .map(x => x.toLowerCase().trim())
    .sort();
}

export function splitAndTrim(
  stringToSplit: string,
  separator: string | RegExp,
): string[] {
  return stringToSplit
    .split(separator)
    .map(item => item.replace(newLineRegex, ' ').trim())
    .filter(item => item.length > 0);
}
