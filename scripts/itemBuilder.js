import { GetItemFromCompendium } from "./compendiumActions.js";
import { log, SwadeItems, armorModRegex } from "./global.js";

export const SkillBuilder = async function (skillsDict) {
    if (skillsDict != undefined){
        var allSkills = [];
        for (const element in skillsDict) {
            var skillFromComp = await GetItemFromCompendium(SwadeItems.SKILL, element);
            if (skillFromComp == undefined) {
                let skill = {};
                let die = {
                    sides: skillsDict[element].sides,
                    modifier: skillsDict[element].modifier
                };
    
                skill.name = element.capitalize();
                skill.type = SwadeItems.SKILL;
                skill.img = "modules/swade-npc-importer/assets/skills.svg"
                skill.data = {
                    die: die,
                    // attribute: GetAttribute(element) 
                }
                allSkills.push(skill);
            } else {
                skillFromComp.data.die.sides = skillsDict[element].sides;
                skillFromComp.data.die.modifier = skillsDict[element].modifier;
                allSkills.push(skillFromComp);
            }
        }
    
        return allSkills;
    }    
}

export const EdgeBuilder = async function (edges) {
    if (edges != undefined) {
        var allEdges = [];
        edges.forEach(async (element) => {
            var edgeFromCompendium = await GetItemFromCompendium(SwadeItems.EDGE, element);
            if (edgeFromCompendium != undefined) {
                allEdges.push(edgeFromCompendium);
            } else {
                let edge = {};
                edge.name = element.capitalize();
                edge.type = SwadeItems.EDGE;
                edge.data = {
                    isArcaneBackground: element.includes("Arcane") ? true : false
                }
                edge.img = "systems/swade/assets/icons/edge.svg";
                allEdges.push(edge);
            }
        });
        return allEdges;
    }
}

export const HindranceBuilder = async function (hindrances) {
    if (hindrances != undefined) {
        var allHindrances = [];
        hindrances.forEach(async (element) => {
            var hindranceFromCompendium = await GetItemFromCompendium(SwadeItems.HINDRANCE, element);
            if (hindranceFromCompendium != undefined) {
                return allHindrances.push(hindranceFromCompendium);
            } else {
                let hindrance = {};
                hindrance.name = element.capitalize();
                hindrance.type = SwadeItems.HINDRANCE;
                hindrance.img = "systems/swade/assets/icons/hindrance.svg";
                return allHindrances.push(hindrance);
            }
        });
        return allHindrances;
    }
}

export const PowerBuilder = async function (powers) {
    if (powers != undefined) {
        var allPowers = [];
        powers.forEach(async (element) => {
            var powerFromCompendium = await GetItemFromCompendium(SwadeItems.POWER, element);
            if (powerFromCompendium != undefined) {
                return allPowers.push(powerFromCompendium);
            } else {
                let power = {};
                power.name = element.capitalize();
                power.type = SwadeItems.POWER
                power.img = "systems/swade/assets/icons/power.svg";
                return allPowers.push(power);
            }
        });
        return allPowers;
    }
}

export const WeaponBuilder = async function (weaponName, description, weaponDamage, range='', rof='', ap='') {
    var weaponFromCompendium = await GetItemFromCompendium(SwadeItems.WEAPON, weaponName);
    if (weaponFromCompendium != undefined) {
        return weaponFromCompendium;
    } else {
        let weapon = {};
        weapon.name = weaponName;
        weapon.type = SwadeItems.WEAPON
        weapon.data = {
            description: description,
            equippable: true,
            equipped: true,
            damage: weaponDamage,
            range: range,
            rof: rof,
            ap: ap
        };
        weapon.img = "systems/swade/assets/icons/weapon.svg";
        return weapon;
    }

}

export const ShieldBuilder = async function (shieldName, description, parry, cover) {
    var shieldFromCompendium = await GetItemFromCompendium(SwadeItems.SHIELD, shieldName);
    if (shieldFromCompendium != undefined) {
        return shieldFromCompendium;
    } else {
        let shield = {};
        shield.name = shieldName;
        shield.type = SwadeItems.SHIELD
        shield.data = {
            description: description,
            equipped: true,
            equippable: true,
            parry: 0,
            cover: 0
        };
        shield.img = "systems/swade/assets/icons/shield.svg";
        return shield;
    }

}

export const ArmorBuilder = async function (armorName, armorBonus, armorDescription) {
    var armorFromCompendium = await GetItemFromCompendium(SwadeItems.ARMOR, armorName);
    if (armorFromCompendium != undefined) {
        return armorFromCompendium;
    } else {
        let armor = {};
        armor.name = armorName;
        armor.type = SwadeItems.ARMOR
        armor.data = {
            description: armorDescription,
            armor: armorBonus,
            equipped: true,
            equippable: true,
        };
        armor.img = "systems/swade/assets/icons/armor.svg";
        return armor;
    }

}

export const GearBuilder = async function (gearName, description) {
    var gearFromCompendium = await GetItemFromCompendium(SwadeItems.GEAR, gearName);
    if (gearFromCompendium != undefined) {
        return gearFromCompendium;
    } else {
        let gear = {};
        gear.name = gearName;
        gear.type = SwadeItems.GEAR
        gear.data = {
            description: description,
            equipped: false,
            equippable: false,
        };
        gear.img = "systems/swade/assets/icons/gear.svg";
        return gear;
    }

}
