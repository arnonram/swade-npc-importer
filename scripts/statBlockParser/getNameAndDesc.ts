import { capitalizeEveryWord } from '../utils/textUtils';
import { newLineRegex } from '../global';

export function getName(rawData: string): string {
  let nameAndDescription = rawData
    .split(game.i18n?.localize('npcImporter.parser.Attributes') as string)[0]
    .trim();
  let lines = nameAndDescription.split(newLineRegex);
  return capitalizeEveryWord(lines[0].trim());
}

export function getBio(rawData: string, sections: string[]): string {
  let nameAndDescription = rawData
    .split(game.i18n?.localize('npcImporter.parser.Attributes') as string)[0]
    .trim();
  let lines = nameAndDescription.split(newLineRegex);
  lines.shift();
  let bio = '';
  lines.forEach(line => {
    if (line.trim().endsWith('.')) {
      line = line + '<br/>';
    }
    bio += `${line} `;
  });

  return getConviction(sections, bio);
}

function getConviction(sections: string[], biography: string): string {
  const conviction = sections.find(x =>
    x.startsWith(
      game.i18n?.localize('npcImporter.parser.Conviction') as string,
    ),
  );
  return conviction ? `${conviction}<hr>${biography}` : biography;
}
