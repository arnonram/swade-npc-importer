import { getModuleSettings } from '../utils/foundryActions';
import { splitAndTrim } from '../utils/textUtils';
import {
  newLineRegex,
  settingBulletPointIcons,
  settingModifiedSpecialAbs,
} from '../global';

export function getAbilityList(
  sections: string[],
  abilityType: AbilityType,
): Record<string, string> {
  const abilityLine = sections.find(x =>
    x.includes(`${game.i18n?.localize(`npcImporter.parser.${abilityType}`)}:`),
  );

  if (!abilityLine) {
    return {};
  }

  return getAbilities(
    abilityLine
      .replace(
        `${game.i18n?.localize(`npcImporter.parser.${abilityType}`)}:`,
        '',
      )
      .trim(),
  );
}

function getAbilities(data: string): { [key: string]: string } {
  const modifiedSpecialAbs = getModuleSettings(settingModifiedSpecialAbs);
  let abilities: { [key: string]: any } = {};
  let line: string[] = [];
  if (!modifiedSpecialAbs) {
    line = splitAndTrim(data, getModuleSettings(settingBulletPointIcons));
  } else {
    line = splitAndTrim(data, '@');
  }

  line.shift();
  line.forEach(element => {
    let ability = element.split(':');
    let abilityName = !modifiedSpecialAbs
      ? ability[0].trim()
      : `@${ability[0].trim()}`;
    if (abilityName) {
      abilities[abilityName] =
        ability.length == 2
          ? ability[1].replace(newLineRegex, ' ').trim()
          : ability[0];
    }
  });

  return abilities;
}

export enum AbilityType {
  SpecialAbilities = 'SpecialAbilities',
  SuperPowers = 'SuperPowers',
}
