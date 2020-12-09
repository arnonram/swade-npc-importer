// this module... obviously
export const thisModule = "swade-npc-importer";

// module defaults and registered settings
export const defaultPackage = "swade-compendium";
export const settingPackageToUse = "packageToUse";
export const settingAdditionalTraits = "additionalStats";
export const settingDefaultDisposition = "defaultDisposition";
export const settingDefaultActorType = "defaultActorType";
export const settingDefaultIsWildcard = "defaultIsWildcard";
export const settingBulletPointIcons = "bulletPointIcons";
export const settingLastSaveFolder = "lastSaveFolder";
export const settingCompsToUse = "compsToUse";
export const settingActiveCompendiums = "activeCompendiums";
export const settingParaeLanguage = "parseLanguage";

// global logger
export const log = function (msg) {
    console.log(`SWADE NPC Importer | ${msg}`)
}

// regex
export const newLineRegex = /\r\n|\n|\r/g;
export const newLineAndBullet = /\r\n\W|\n\W|\r\W/g;
export const diceRegex = /(\d+)?d(\d+)([\+\-]\d+)?/g;
export const closingParenthesis = /\)/g;
export const gearParsingRegex = /(^[\w\s]+)(\(([^()]+)\))?,?/gi;
export const meleeDamageRegex = /Str\.|Str[\+\-](\d+)?d?(\d+)?[\+\-]?(\d+)?d?(\d+)/g;
export const weaponRangeRegex = /\d+\/\d+\/\d+/g;
export const armorModRegex = /\+\d+/;
