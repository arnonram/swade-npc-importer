import { Attributes, ImportedDie } from '../types/importedActor';
import { splitAndTrim } from '../utils/textUtils';

export function getAttributes(sections: string[]): Attributes {
  const attrTranslation = new RegExp(
    `${game.i18n?.localize('npcImporter.parser.Attributes')}:`,
    'i',
  );

  let attrSection = sections.find(x => x.match(attrTranslation));
  if (!attrSection) {
    return {} as Attributes;
  }

  const isAnimal = attrSection.includes('(A)');
  attrSection = attrSection.replace('(A)', '');
  let attributes = splitAndTrim(attrSection.replace(attrTranslation, ''), ',');

  const attr: Attributes = {
    agility: {
      die: buildTraitDie(
        (
          attributes.find(x =>
            x
              .toLowerCase()
              .startsWith(
                game.i18n
                  ?.localize('npcImporter.parser.Agility')
                  .toLowerCase() || '',
              ),
          ) || ''
        ).trim(),
      ),
    },
    smarts: {
      die: buildTraitDie(
        (
          attributes.find(x =>
            x
              .toLowerCase()
              .startsWith(
                game.i18n
                  ?.localize('npcImporter.parser.Smarts')
                  .toLowerCase() || '',
              ),
          ) || ''
        ).trim(),
      ),
      animal: isAnimal,
    },
    spirit: {
      die: buildTraitDie(
        (
          attributes.find(x =>
            x
              .toLowerCase()
              .startsWith(
                game.i18n
                  ?.localize('npcImporter.parser.Spirit')
                  .toLowerCase() || '',
              ),
          ) || ''
        ).trim(),
      ),
    },
    strength: {
      die: buildTraitDie(
        (
          attributes.find(x =>
            x
              .toLowerCase()
              .startsWith(
                game.i18n
                  ?.localize('npcImporter.parser.Strength')
                  .toLowerCase() || '',
              ),
          ) || ''
        ).trim(),
      ),
    },
    vigor: {
      die: buildTraitDie(
        (
          attributes.find(x =>
            x
              .toLowerCase()
              .startsWith(
                game.i18n?.localize('npcImporter.parser.Vigor').toLowerCase() ||
                  '',
              ),
          ) || ''
        ).trim(),
      ),
    },
  };

  return attr;
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
    const diceRegex = game.i18n?.localize('npcImporter.regex.dice') || '';
    const matchResult = data.match(new RegExp(diceRegex, 'i'));
    diceAndMode = matchResult ? matchResult[0].toString() : '';
  } catch (error) {
    diceAndMode = '1'; // usually will be 1, if not then we'll need to think about it.
  }

  let traitDice = diceAndMode.includes('+')
    ? diceAndMode.split('+')[0]
    : diceAndMode.split('-')[0];
  let traitMod = diceAndMode.includes('+')
    ? `+${diceAndMode.split('+')[1]}`
    : diceAndMode.includes('-')
      ? `-${diceAndMode.split('-')[1]}`
      : '0';
  return {
    sides: parseInt(traitDice.trim().replace(/[A-Za-z]/i, '')),
    modifier: parseInt(traitMod.trim()),
  };
}
