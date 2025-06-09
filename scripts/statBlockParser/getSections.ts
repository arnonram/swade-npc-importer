import { getActorAddtionalStatsArray } from '../utils/foundryActions';

export function getSections(clipData: string): string[] {
  let inputData = clipData.replace(/(\r\n|\n|\r)/gm, ' ').replace('/ ', '/');
  let indexes = getSectionsIndex(inputData);
  if (indexes.length === 0) {
    throw 'Not a valid statblock';
  }
  var sections: string[] = [];
  for (let i = 0; i < indexes.length; i++) {
    if (i === indexes.length - 1) {
      sections.push(inputData.substring(indexes[i]).trim());
    } else {
      sections.push(inputData.substring(indexes[i], indexes[i + 1]).trim());
    }
  }
  return sections;
}

function getSectionsIndex(inputData: string) {
  const allStatBlockEntities = [
    `${game?.i18n?.localize('npcImporter.parser.Attributes')}:`,
    `${game?.i18n?.localize('npcImporter.parser.Skills')}:`,
    `${game?.i18n?.localize('npcImporter.parser.Hindrances')}:`,
    `${game?.i18n?.localize('npcImporter.parser.Edges')}:`,
    `${game?.i18n?.localize('npcImporter.parser.Powers')}:`,
    `${game?.i18n?.localize('npcImporter.parser.Pace')}:`,
    `${game?.i18n?.localize('npcImporter.parser.Parry')}:`,
    `${game?.i18n?.localize('npcImporter.parser.Toughness')}:`,
    `${game?.i18n?.localize('npcImporter.parser.PowerPoints')}:`,
    `${game?.i18n?.localize('npcImporter.parser.Gear')}:`,
    `${game?.i18n?.localize('npcImporter.parser.SpecialAbilities')}:`,
    `${game?.i18n?.localize('npcImporter.parser.SuperPowers')}:`,
    `${game?.i18n?.localize('npcImporter.parser.Conviction')}:`,
  ];

  let allStats = allStatBlockEntities.concat(getActorAddtionalStatsArray());
  let sectionsIndex: number[] = [];
  allStats.forEach(element => {
    let index = inputData.search(new RegExp(element, 'i'));
    if (index > 0) {
      sectionsIndex.push(index);
    }
  });
  return sectionsIndex.sort(function (a, b) {
    return a - b;
  });
}
