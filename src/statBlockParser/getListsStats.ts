import { foundryI18nLocalize } from '../utils/foundryWrappers';
import { newLineRegex } from '../global';

/**
 * Extracts a list stat (e.g., Hindrances, Edges, Powers) from the stat block sections.
 */
export function getListStat(sections: string[], labelKey: ListType): string[] {
  const line = findSection(sections, labelKey);
  return line ? handleSpecialCharacters(line) : [];
}

// Longest core power names are 2-3 words (e.g. "Boost/Lower Trait"); trappings in parentheses don't count.
const maxItemNameWords = 4;

/**
 * Some stat blocks describe powers or hindrances in a sentence instead of listing them.
 * Returns that section's text, or undefined if the section is a regular list.
 */
export function getProseList(
  sections: string[],
  labelKey: ListType,
): string | undefined {
  const line = findSection(sections, labelKey);
  if (!line) return undefined;
  const items = handleSpecialCharacters(line);
  const various = foundryI18nLocalize('npcImporter.parser.Various')
    .toLowerCase()
    .split('|');
  const isProse =
    items.some(
      item =>
        item
          .replace(/\(.*\)/, '')
          .trim()
          .split(/\s+/).length > maxItemNameWords,
    ) || various.includes(items[0]?.toLowerCase());
  return isProse ? line.replace(newLineRegex, ' ').trim() : undefined;
}

/** Section labels for a list; powers are sometimes listed as "Spells:". */
function sectionLabels(labelKey: ListType): string[] {
  const keys =
    labelKey === ListType.Powers ? [ListType.Powers, 'Spells'] : [labelKey];
  return keys.map(
    key => `${foundryI18nLocalize(`npcImporter.parser.${key}`) || key}:`,
  );
}

function findSection(
  sections: string[],
  labelKey: ListType,
): string | undefined {
  const labels = sectionLabels(labelKey);
  return sections.find(x => labels.some(label => x.startsWith(label)));
}

function cleanLine(line: string): string {
  return line
    .slice(line.indexOf(':') + 1)
    .replace(newLineRegex, ' ')
    .replace(/\s*\/\s*/g, '/')
    .replace(/\.$/, '')
    .trim();
}

function handleSpecialCharacters(line: string): string[] {
  const data = cleanLine(line)
    // "Obligation (Major) — Serve Lord" -> "Obligation (Major — Serve Lord)"
    .replace(/\)\s*[—–]\s*([^,()]+)/g, (_match, note) => ` — ${note.trim()})`);
  if (data.length > 1) {
    const matches = data.match(
      /([A-Za-zÀ-ÖØ-öø-ÿ0-9!.\-’'/ ]+)(\(([^)]+)\))?/gi,
    );
    return matches
      ? matches.map(s => s.trim().replace(/^(and|or)\s+/i, '')).filter(Boolean)
      : [];
  }
  return [];
}

export enum ListType {
  Hindrances = 'Hindrances',
  Edges = 'Edges',
  Powers = 'Powers',
}
