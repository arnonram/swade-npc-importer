// this module... obviously
export const thisModule = 'swade-npc-importer';

// module defaults and registered settings
export const defaultPackage = 'swade-compendium';
export const settingPackageToUse = 'packageToUse';
export const settingAdditionalTraits = 'additionalStats';
export const settingDefaultDisposition = 'defaultDisposition';
export const settingDefaultActorType = 'defaultActorType';
export const settingDefaultIsWildcard = 'defaultIsWildcard';
export const settingBulletPointIcons = 'bulletPointIcons';
export const settingLastSaveFolder = 'lastSaveFolder';
export const settingCompsToUse = 'compsToUse';
export const settingActiveCompendiums = 'activeCompendiums';
export const settingParaeLanguage = 'parseLanguage';
export const settingModifiedSpecialAbs = 'modSpecailAbs';
export const settingToken = 'tokenSettings';
export const settingCalculateIgnoredWounds = 'calculateIgnoreWounds';
export const settingCalculateAdditionalWounds = 'calculateAdditionalWounds';
export const settingAutoCalcToughness = 'autoCalcToughness';
export const settingAutoCalcSize = 'autoCalcSize';
export const settingallAsSpecialAbilities = 'allAsSpecialAbilities';
export const twoHandsNotaiton = 'twoHandsNotaiton';
export const settingNumberOfBennies = 'numberOfBennies';
export const allPacks: any[] = [];

// global logger
export const log = function (msg: string): void {
  console.log(`SWADE Stat Block Importer | ${msg}`);
};

// regex
export const newLineRegex = /\r\n|\n|\r/g;
export const gearParsingRegex =
  /(^[A-Za-zÀ-ÖØ-öø-ÿ0-9 \.\-]+)(\(([^()]+)\))?,?/gi;
export const armorModRegex = /\+\d+/;
export const plusMinusNumRegex = /([+-])\\d+/;

// console logger override //
// This is to ensure all console logs are prefixed with a consistent message
const PREFIX = '[SWADE Stat Block Importer]';

const originalLog = console.log;
const originalInfo = console.info;
const originalWarn = console.warn;
const originalError = console.error;

console.log = (...args: any[]) => {
  originalLog(PREFIX, ...args);
};

console.info = (...args: any[]) => {
  originalInfo(PREFIX, ...args);
};

console.warn = (...args: any[]) => {
  originalWarn(PREFIX, ...args);
};

console.error = (...args: any[]) => {
  originalError(PREFIX, ...args);
};
