import { newLineRegex } from '../global';

export function getListStat(
  sections: string[],
  labelKey: ListType,
): string[] | undefined {
  const label = `${game.i18n?.localize(`npcImporter.parser.${labelKey}`)}:`;
  const line = sections.find(x => x.startsWith(label));
  return line ? handleSpecialCharacters(line) : undefined;
}

function cleanLine(line: string): string {
  return line
    .slice(line.indexOf(':') + 1)
    .replace(newLineRegex, ' ')
    .replace('.', '')
    .trim();
}

function handleSpecialCharacters(line: string): string[] | undefined {
  const data = cleanLine(line);
  if (data.length > 1) {
    const matches = data.match(
      new RegExp(/([A-Za-zÀ-ÖØ-öø-ÿ0-9!\-’' ]+)(\(([^\)]+)\))?/gi),
    );
    return matches ? matches.map(s => s.trim()) : [];
  }
}

export enum ListType {
  Hindrances = 'Hindrances',
  Edges = 'Edges',
  Powers = 'Powers',
}
