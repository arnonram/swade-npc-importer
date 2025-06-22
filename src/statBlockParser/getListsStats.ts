import { foundryI18nLocalize } from '../utils/foundryWrappers';
import { newLineRegex } from '../global';

/**
 * Extracts a list stat (e.g., Hindrances, Edges, Powers) from the stat block sections.
 */
export function getListStat(sections: string[], labelKey: ListType): string[] {
  const label = `${foundryI18nLocalize(`npcImporter.parser.${labelKey}`) || labelKey}:`;
  const line = sections.find(x => x.startsWith(label));
  return line ? handleSpecialCharacters(line) : [];
}

function cleanLine(line: string): string {
  return line
    .slice(line.indexOf(':') + 1)
    .replace(newLineRegex, ' ')
    .replace(/\.$/, '')
    .trim();
}

function handleSpecialCharacters(line: string): string[] {
  const data = cleanLine(line);
  if (data.length > 1) {
    const matches = data.match(
      /([A-Za-zÀ-ÖØ-öø-ÿ0-9!\-’' ]+)(\(([^\)]+)\))?/gi,
    );
    return matches ? matches.map(s => s.trim()) : [];
  }
  return [];
}

export enum ListType {
  Hindrances = 'Hindrances',
  Edges = 'Edges',
  Powers = 'Powers',
}
