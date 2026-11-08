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

// Longest core power names are 2-3 words (e.g. "Boost/Lower Trait"); trappings in parentheses don't count.
const maxPowerNameWords = 4;

/**
 * Some stat blocks describe powers in a sentence instead of listing them
 * ("Jinni have access to all spells, or as the Game Master deems appropriate").
 * Returns that Powers text, or undefined if the section is a regular list.
 */
export function getProsePowers(sections: string[]): string | undefined {
  const label = `${foundryI18nLocalize('npcImporter.parser.Powers') || ListType.Powers}:`;
  const line = sections.find(x => x.startsWith(label));
  if (!line) return undefined;
  const isProse = handleSpecialCharacters(line).some(
    power =>
      power
        .replace(/\(.*\)/, '')
        .trim()
        .split(/\s+/).length > maxPowerNameWords,
  );
  return isProse ? line.replace(newLineRegex, ' ').trim() : undefined;
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
