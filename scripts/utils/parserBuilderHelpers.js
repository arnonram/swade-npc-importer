import { meleeDamageRegex, armorModRegex } from "../global.js";


export const GetMeleeDamage = function (abilityDescription) {
    let damage = abilityDescription.match(meleeDamageRegex).toString().replace('.', '').toLowerCase();
    return `@${damage}`;
};

export const GetArmorBonus = function (data) {
    return parseInt(data.match(armorModRegex)[0]);
};

export const GetParryBonus = function (data) {
    let parryRegex = new RegExp(`(\\+\\+d|\\-\\d+) ${game.i18n.localize("npcImporter.parser.Parry")}`);
    return parseInt(data.match(parryRegex)[0]);
};

export const GetCoverBonus = function (data) {
    let coverRegex = new RegExp(`(\\+\\+d|\\-\\d+) ${game.i18n.localize("npcImporter.parser.Parry")}`);
    return parseInt(data.match(coverRegex)[0]);
};
