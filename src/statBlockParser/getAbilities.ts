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
  const headers = abilityHeaderRegexes(abilityType);
  const abilityLine = sections.find(x => headers.some(r => r.test(x)));

  if (!abilityLine) {
    return {};
  }

  const header = headers.find(r => r.test(abilityLine)) as RegExp;
  return getAbilities(abilityLine.replace(header, '').trim());
}

/**
 * Header patterns for an ability section: "Special Abilities:" (any case),
 * or the colonless all-caps "SPECIAL ABILITIES" used by some books.
 * Mixed-case without colon is not a header (e.g. the edge "Super Powers (30)").
 */
export function abilityHeaderRegexes(abilityType: AbilityType): RegExp[] {
  const label = foundryI18nLocalize(`npcImporter.parser.${abilityType}`);
  return [
    new RegExp(`${label}:`, 'i'),
    new RegExp(`${label.toUpperCase()}(?=\\s|$)`),
  ];
}

function getAbilities(data: string): Record<string, string> {
  const modifiedSpecialAbs = getModuleSettings(settingModifiedSpecialAbs);
  // PDF symbol-font bullets (e.g. Wingdings) paste as C1 control or
  // Private Use Area chars, which never occur in real text.
  const bullets = [getModuleSettings(settingBulletPointIcons), pdfSymbolBullets]
    .filter(Boolean)
    .join('|');
  const delimiter = modifiedSpecialAbs ? /@/ : new RegExp(bullets, 'ig');
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

const pdfSymbolBullets = '[\\u0080-\\u009F\\uE000-\\uF8FF]';

export enum AbilityType {
  SpecialAbilities = 'SpecialAbilities',
  SuperPowers = 'SuperPowers',
}
