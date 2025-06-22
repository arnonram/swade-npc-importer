import { Logger } from '../utils/logger';
import { Attributes, ImportedDie } from '../types/importedActor';
import { splitAndTrim } from '../utils/textUtils';

export function getAttributes(sections: string[]): Attributes {
  const attrLabel =
    game.i18n?.localize('npcImporter.parser.Attributes') || 'Attributes';
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
      label: game.i18n?.localize('npcImporter.parser.Agility') || 'Agility',
    },
    {
      key: 'smarts',
      label: game.i18n?.localize('npcImporter.parser.Smarts') || 'Smarts',
    },
    {
      key: 'spirit',
      label: game.i18n?.localize('npcImporter.parser.Spirit') || 'Spirit',
    },
    {
      key: 'strength',
      label: game.i18n?.localize('npcImporter.parser.Strength') || 'Strength',
    },
    {
      key: 'vigor',
      label: game.i18n?.localize('npcImporter.parser.Vigor') || 'Vigor',
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
    `${game.i18n?.localize('npcImporter.parser.Skills')}:`,
    'i',
  );
  const skillsSection = sections.find(x => x.match(trait));
  let skills = skillsSection
    ? splitAndTrim(skillsSection.replace(trait, ''), ',')
    : [];
  let skillsDict: { [key: string]: ImportedDie } = {};
  skills.forEach(singleTrait => {
    const matchResult = singleTrait.match(
      new RegExp(game.i18n?.localize('npcImporter.regex.dice') || '', 'i'),
    );
    if (!matchResult) {
      Logger.warn(
        `Following trait was not imported since it was malformed: ${singleTrait}`,
      );
      return;
    }

    let diceAndMode = matchResult ? matchResult[0].toString() : '';
    let traitName = singleTrait
      .replace(diceAndMode, '')
      .trim()
      .replace(' )', ')');
    if (traitName) {
      skillsDict[traitName.toLowerCase().replace(':', '').replace('.', '')] =
        buildTraitDie(diceAndMode);
    }
  });
  return skillsDict;
}

function buildTraitDie(data: string): ImportedDie {
  let diceAndMode = '';
  try {
    const diceRegex =
      game.i18n?.localize('npcImporter.regex.dice') || '\\d+d\\d+';
    const matchResult = data.match(new RegExp(diceRegex));
    diceAndMode = matchResult ? matchResult[0].toString() : '';
  } catch (error) {
    diceAndMode = '1';
  }

  let traitDice = diceAndMode.includes('+')
    ? diceAndMode.split('+')[0]
    : diceAndMode.split('-')[0];
  let traitMod = diceAndMode.includes('+')
    ? `+${diceAndMode.split('+')[1]}`
    : diceAndMode.includes('-')
      ? `-${diceAndMode.split('-')[1]}`
      : '0';

  const sides = parseInt(traitDice.trim().replace(/[A-Za-z]/gi, '')) || 0;
  const modifier = parseInt(traitMod.trim()) || 0;

  return { sides, modifier };
}
