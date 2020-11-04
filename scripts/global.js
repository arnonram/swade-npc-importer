export const module = "swade-compendium";

export const log = function (msg) {
    console.log(`SWADE NPC Importer | ${msg}`)
}

export const newLineRegex = /\r\n/gi;
export const diceRegex = /(\d+)?d(\d+)([\+\-]\d+)?/gi;
export const closingParenthesis = /\)/g;

export const SwadeItems = {
    SKILL: 'skill',
    EDGE: 'edge',
    HINDRANCE: 'hindrance',
    POWER: 'power',
    SHIELD: 'shield',
    ARMOR: 'armor',
    WEAPON: 'weapon',
    GEAR: 'gear'
}