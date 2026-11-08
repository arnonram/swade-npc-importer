import { Logger } from '../utils/logger';
import type { Attributes, ImportedDie } from '../types/importedActor';
import { splitAndTrim } from '../utils/textUtils';
import { foundryI18nLocalize } from '../utils/foundryWrappers';
import { buildTraitDie } from './parserBuilderHelpers';

/**
 * Some books drop the comma between traits ("Agility d6 Smarts d8");
 * add it back after a die that is directly followed by the next trait's name.
 */
function separateTraits(text: string): string {
  const dice = foundryI18nLocalize('npcImporter.parser.dice') || 'd';
  return text.replace(
    new RegExp(`(\\b${dice}\\d+(?:\\s*[+\\-−]\\s*\\d+)?)\\s+(?=\\p{Lu})`, 'gu'),
    '$1, ',
  );
}

export function getAttributes(sections: string[]): Attributes {
  const attrLabel =
    foundryI18nLocalize('npcImporter.parser.Attributes') || 'Attributes';
  const attrTranslation = new RegExp(`${attrLabel}:`, 'i');
  let attrSection = sections.find(x => x.match(attrTranslation));
  if (!attrSection) return {} as Attributes;

  const isAnimal = attrSection.includes('(A)');
  attrSection = attrSection.replace('(A)', '');
  const attributes = splitAndTrim(
    separateTraits(attrSection.replace(attrTranslation, '')),
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
  const trait = new RegExp(
    `${foundryI18nLocalize('npcImporter.parser.Skills')}:`,
    'i',
  );
  const skillsSection = sections.find(x => x.match(trait));
  const skills = skillsSection
    ? splitAndTrim(separateTraits(skillsSection.replace(trait, '')), ',')
    : [];
  const skillsDict: { [key: string]: ImportedDie } = {};
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

    const diceAndMod = matchResult ? matchResult[0].toString() : '';
    const traitName = singleTrait
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
