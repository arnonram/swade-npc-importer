import { Attributes, Trait } from '../types/importedActor';
import { splitAndTrim } from '../utils/textUtils';

export function getAttributes(sections: string[]): Attributes {
  const attrTranslation = new RegExp(
    `${game.i18n?.localize('npcImporter.parser.Attributes')}:`,
    'i',
  );

  const attrSection = sections.find(x => x.match(attrTranslation));
  if (!attrSection) {
    return {} as Attributes;
  }

  const isAnimal = attrSection.includes('(A)');
  attrSection.replace('(A)', '');
  let attributes = splitAndTrim(attrSection.replace(attrTranslation, ''), ',');

  let attr: Partial<Attributes> = {};

  attributes.forEach(singleTrait => {
    switch (singleTrait.trim().toLowerCase()) {
      case game.i18n?.localize('npcImporter.parser.Agility'):
        attr.agility = buildTrait(
          singleTrait
            .replace(
              game.i18n?.localize('npcImporter.parser.Agility') as string,
              '',
            )
            .trim(),
        );

      case game.i18n?.localize('npcImporter.parser.Smarts'):
        attr.smarts = buildTrait(
          singleTrait
            .replace(
              game.i18n?.localize('npcImporter.parser.Smarts') as string,
              '',
            )
            .trim(),
        );
        attr.smarts.animal = isAnimal;

      case game.i18n?.localize('npcImporter.parser.Spirit'):
        attr.spirit = buildTrait(
          singleTrait
            .replace(
              game.i18n?.localize('npcImporter.parser.Spirit') as string,
              '',
            )
            .trim(),
        );

      case game.i18n?.localize('npcImporter.parser.Strength'):
        attr.strength = buildTrait(
          singleTrait
            .replace(
              game.i18n?.localize('npcImporter.parser.Strength') as string,
              '',
            )
            .trim(),
        );

      case game.i18n?.localize('npcImporter.parser.Vigor'):
        attr.vigor = buildTrait(
          singleTrait
            .replace(
              game.i18n?.localize('npcImporter.parser.Vigor') as string,
              '',
            )
            .trim(),
        );
    }
  });

  return attr as Attributes;
}

export function getSkills(sections: string[]): { [key: string]: Trait } {
  let trait = new RegExp(
    `${game.i18n?.localize('npcImporter.parser.Skills')}:`,
    'i',
  );
  const skillsSection = sections.find(x => x.match(trait));
  let skills = skillsSection
    ? splitAndTrim(skillsSection.replace(trait, ''), ',')
    : [];
  let skillsDict: { [key: string]: Trait } = {};
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
        buildTrait(diceAndMode);
    }
  });
  return skillsDict;
}

function buildTrait(data: string): Trait {
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
  var trait: Trait = {
    sides: parseInt(traitDice.trim().replace(/[A-Za-z]/i, '')),
    modifier: parseInt(traitMod.trim()),
  };
  return trait;
}
