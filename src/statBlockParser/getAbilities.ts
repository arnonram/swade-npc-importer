import { getModuleSettings } from '../utils/foundryActions';
import { splitAndTrim } from '../utils/textUtils';
import {
  newLineRegex,
  settingBulletPointIcons,
  settingModifiedSpecialAbs,
} from '../global';
import { foundryI18nLocalize } from '../utils/foundryWrappers';

export function getAbilityList(
  sections: string[],
  abilityType: AbilityType,
): Record<string, string> {
  const abilityLine = sections.find(x =>
    x.includes(`${foundryI18nLocalize(`npcImporter.parser.${abilityType}`)}:`),
  );

  if (!abilityLine) {
    return {};
  }

  return getAbilities(
    abilityLine
      .replace(
        `${foundryI18nLocalize(`npcImporter.parser.${abilityType}`)}:`,
        '',
      )
      .trim(),
  );
}

function getAbilities(data: string): Record<string, string> {
  const modifiedSpecialAbs = getModuleSettings(settingModifiedSpecialAbs);
  const delimiter = modifiedSpecialAbs
    ? /@/
    : new RegExp(getModuleSettings(settingBulletPointIcons), 'ig');
  const lines = splitAndTrim(data, delimiter);
  const abilities: Record<string, string> = {};

  for (const element of lines) {
    const [name, ...rest] = element.split(':');
    const abilityName = modifiedSpecialAbs ? `@${name.trim()}` : name.trim();
    if (!abilityName) continue;
    const value =
      rest.length > 0
        ? rest.join(':').replace(newLineRegex, ' ').trim()
        : name.replace(/^.* /, '').trim();
    abilities[abilityName] = value;
  }

  return abilities;
}

export enum AbilityType {
  SpecialAbilities = 'SpecialAbilities',
  SuperPowers = 'SuperPowers',
}
