import { Logger } from '../utils/logger';
import { Attributes, ImportedDie } from '../types/importedActor';
import { splitAndTrim } from '../utils/textUtils';
import { foundryI18nLocalize } from '../utils/foundryWrappers';
import { buildTraitDie } from './parserBuilderHelpers';

export function getAttributes(sections: string[]): Attributes {
  const attrLabel =
    foundryI18nLocalize('npcImporter.parser.Attributes') || 'Attributes';
  const attrTranslation = new RegExp(`${attrLabel}:`, 'i');
  let attrSection = sections.find(x => x.match(attrTranslation));
  if (!attrSection) return {} as Attributes;

  const isAnimal = attrSection.includes('(A)');
  attrSection = attrSection.replace('(A)', '');
  const attributes = splitAndTrim(
    attrSection.replace(attrTranslation, ''),
    ',',
  );

  const attrKeys = [
    {
      key: 'agility',
      label: foundryI18nLocalize('npcImporter.parser.Agility') || 'Agility',
    },
    {
      key: 'smarts',
      label: foundryI18nLocalize('npcImporter.parser.Smarts') || 'Smarts',
    },
    {
      key: 'spirit',
      label: foundryI18nLocalize('npcImporter.parser.Spirit') || 'Spirit',
    },
    {
      key: 'strength',
      label: foundryI18nLocalize('npcImporter.parser.Strength') || 'Strength',
    },
    {
      key: 'vigor',
      label: foundryI18nLocalize('npcImporter.parser.Vigor') || 'Vigor',
    },
  ];

  const attr: any = {};
  for (const { key, label } of attrKeys) {
    const found =
      attributes.find(x => x.toLowerCase().startsWith(label.toLowerCase())) ||
      '';
    attr[key] = { die: buildTraitDie(found.trim()) };
  }
  attr.smarts.animal = isAnimal;
  return attr as Attributes;
}

export function getSkills(sections: string[]): { [key: string]: ImportedDie } {
  let trait = new RegExp(
    `${foundryI18nLocalize('npcImporter.parser.Skills')}:`,
    'i',
  );
  const skillsSection = sections.find(x => x.match(trait));
  let skills = skillsSection
    ? splitAndTrim(skillsSection.replace(trait, ''), ',')
    : [];
  let skillsDict: { [key: string]: ImportedDie } = {};
  skills.forEach(singleTrait => {
    const matchResult = singleTrait.match(
      new RegExp(foundryI18nLocalize('npcImporter.regex.dice'), 'i'),
    );
    if (!matchResult) {
      Logger.warn(
        `Following trait was not imported since it was malformed: ${singleTrait}`,
      );
      return;
    }

    let diceAndMod = matchResult ? matchResult[0].toString() : '';
    let traitName = singleTrait
      .replace(diceAndMod, '')
      .trim()
      .replace(' )', ')');
    if (traitName) {
      skillsDict[traitName.toLowerCase().replace(':', '').replace('.', '')] =
        buildTraitDie(diceAndMod);
    }
  });
  return skillsDict;
}
