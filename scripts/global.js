export const thisModule = "swade-npc-importer";
export const defaultPackage = "swade-compendium";
export const settingPackageToUse = "packageToUse"


export const log = function (msg) {
    console.log(`SWADE NPC Importer | ${msg}`)
}

export const newLineRegex = /\r\n|\n|\r/g;
export const newLineAndBullet = /\r\n\W|\n\W|\r\W/g;
export const bulletRegex = /•|/g;
export const diceRegex = /(\d+)?d(\d+)([\+\-]\d+)?/gi;
export const closingParenthesis = /\)/g;
export const meleeDamageRegex = /Str\.|Str[\+\-](\d+)?d?(\d+)?[\+\-]?(\d+)?d?(\d+)/g;
export const armorModRegex = /\+\d|\-\d/;
export const parryModRegex = /(\+\d|\-\d) Parry/;
export const coverModRegex = /(\+\d|\-\d) Cover/;

export const attributesAndSkills = ["Attributes:", "Skills:"];
export const supportedListStats = ["Hindrances:", "Edges:", "Powers:"];
export const baseStats = ["Pace:", "Parry:", "Toughness:", "Power Points:"];
export const additionalStats = ["Sanity:", "Conviction:", "Strain:"];
export const gear = ["Gear:"];
export const supportedBulletListStats = ["Special Abilities:", "Super Powers:"];
export const allStatBlockEntities = attributesAndSkills.concat(supportedListStats, baseStats, supportedBulletListStats, gear, additionalStats);

export const UnshakeBonus = ['undead', 'construct', 'combat reflexes'];
export const IgnoreWound = ['undead', 'construct', 'elemental'];

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

export const Traits = {
    AGILITY: 'agility',
    SMARTS: 'smarts',
    SPIRIT: 'spirit',
    STRENGTH: 'strength',
    VIGOR: 'vigor'
}

export const GetMeleeDamage = function(abilityDescription){
    let damage = abilityDescription.match(meleeDamageRegex).toString().replace('.', '').toLowerCase();
    return `@${damage}`;
}

export const GetArmorBonus = function(data){
    return parseInt(data.match(armorModRegex)[0]);
}

export const GetParryBonus = function(data){
    return parseInt(data.match(parryModRegex)[0]);
}

export const GetCoverBonus = function(data){
    return parseInt(data.match(coverModRegex)[0]);
}

export const capitalize = function(string){
    return string.replace(/(?:^|\s)\S/g, function(a) { 
        return a.toUpperCase(); 
    });
}