import { capitalizeEveryWord } from '../utils/textUtils';
import { newLineRegex } from '../global';
import { foundryI18nLocalize } from '../utils/foundryWrappers';

function extractNameAndDescription(rawData: string): string[] {
  const attrLabel =
    foundryI18nLocalize('npcImporter.parser.Attributes') || 'Attributes';
  const nameAndDescription = rawData.split(attrLabel)[0].trim();
  return nameAndDescription.split(newLineRegex);
}

/**
 * Extracts and capitalizes the name from the raw stat block.
 */
export function getName(rawData: string): string {
  const lines = extractNameAndDescription(rawData);
  const name = (lines[0] || '').trim();
  return capitalizeEveryWord(
    hasWildCardMarker(rawData) ? name.replace(wildCardMarker, '') : name,
  );
}

// The Wild Card symbol in SWADE PDFs copies as a "D" before an all-caps name: "D CHIEFTAIN".
const wildCardMarker = /^D\s+(?=[^a-z]+$)/;

export function hasWildCardMarker(rawData: string): boolean {
  const firstLine = (extractNameAndDescription(rawData)[0] || '').trim();
  return wildCardMarker.test(firstLine);
}

/**
 * Extracts the biography from the raw stat block and appends conviction if present.
 */
export function getBio(rawData: string, sections: string[]): string {
  const lines = extractNameAndDescription(rawData);
  const bioLines = lines
    .slice(1)
    .map(line => {
      const trimmed = line.trim();
      return trimmed
        ? trimmed.endsWith('.')
          ? `${trimmed}<br/>`
          : trimmed
        : '';
    })
    .filter(Boolean);
  const bio = bioLines.join(' ').trim();
  return getConviction(sections, bio);
}

function getConviction(sections: string[], biography: string): string {
  const convictionLabel =
    foundryI18nLocalize('npcImporter.parser.Conviction') || 'Conviction';
  const conviction = sections.find(x => x.startsWith(convictionLabel));
  return conviction ? `${conviction}<hr>${biography}` : biography;
}
