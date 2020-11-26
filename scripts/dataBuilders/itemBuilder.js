import { GetItemFromCompendium, getSpecificAdditionalStat } from "../foundryActions.js";
import { SwadeItems, log, capitalize } from "../global.js";

export const SkillBuilder = async function (skillsDict) {
    if (skillsDict != undefined) {
        var allSkills = [];
        for (const element in skillsDict) {
            var skillFromComp = await GetItemFromCompendium(SwadeItems.SKILL, element);
            try {
                if (skillFromComp == undefined) {
                    let skill = {};
                    let die = {
                        sides: skillsDict[element].sides,
                        modifier: skillsDict[element].modifier
                    };

                    skill.name = capitalize(element);
                    skill.type = SwadeItems.SKILL;
                    skill.img = "systems/swade/assets/icons/skill.svg"
                    skill.data = {
                        die: die,
                    }
                    allSkills.push(skill);
                } else {
                    skillFromComp.data.die.sides = skillsDict[element].sides;
                    skillFromComp.data.die.modifier = skillsDict[element].modifier;
                    allSkills.push(skillFromComp);
                }
            } catch (error) {
                log(`Could not build skill: ${error}`)
            }
        }
        return allSkills;
    }
}

export const EdgeBuilder = async function (edges) {
    if (edges != undefined) {
        var allEdges = [];
        for (let i = 0; i < edges.length; i++) {
            const element = edges[i];
            var edgeFromCompendium = await GetItemFromCompendium(SwadeItems.EDGE, element);
            try {
                if (edgeFromCompendium != undefined) {
                    allEdges.push(edgeFromCompendium);
                } else {
                    let edge = {};
                    edge.name = capitalize(element)
                    edge.type = SwadeItems.EDGE;
                    edge.data = {
                        isArcaneBackground: element.includes("Arcane") ? true : false
                    }
                    edge.img = "systems/swade/assets/icons/edge.svg";
                    allEdges.push(edge);
                }
            } catch (error) {
                log(`Could not build edge: ${error}`)
            }
        }
        return allEdges;
    }
}

export const HindranceBuilder = async function (hindrances) {
    if (hindrances != undefined) {
        var allHindrances = [];
        for (let i = 0; i < hindrances.length; i++) {
            const element = hindrances[i];
            var hindranceFromCompendium = await GetItemFromCompendium(SwadeItems.HINDRANCE, element);
            try {
                if (hindranceFromCompendium != undefined) {
                    allHindrances.push(hindranceFromCompendium);
                } else {
                    let hindrance = {};
                    hindrance.name = capitalize(element);
                    hindrance.type = SwadeItems.HINDRANCE;
                    hindrance.img = "systems/swade/assets/icons/hindrance.svg";
                    allHindrances.push(hindrance);
                }
            } catch (error) {
                log(`Could not build hindrance: ${error}`)
            }
        }

        return allHindrances;
    }
}

export const PowerBuilder = async function (powers) {
    if (powers != undefined) {
        var allPowers = [];
        for (let i = 0; i < powers.length; i++) {
            const element = powers[i];
            var powerFromCompendium = await GetItemFromCompendium(SwadeItems.POWER, element);
            try {
                if (powerFromCompendium != undefined) {
                    allPowers.push(powerFromCompendium);
                } else {
                    let power = {};
                    power.name = capitalize(element);
                    power.type = SwadeItems.POWER
                    power.img = "systems/swade/assets/icons/power.svg";
                    allPowers.push(power);
                }
            } catch (error) {
                log(`Could not build power: ${error}`)
            }
        }

        return allPowers;
    }
}

export const WeaponBuilder = async function (weaponName, description, weaponDamage, range = '', rof = '', ap = '') {
    var weaponFromCompendium = await GetItemFromCompendium(SwadeItems.WEAPON, weaponName);
    try {
        if (weaponFromCompendium != undefined) {
            return weaponFromCompendium;
        } else {
            let weapon = {};
            weapon.name = capitalize(weaponName);
            weapon.type = SwadeItems.WEAPON
            weapon.data = {
                description: description,
                equippable: true,
                equipped: true,
                damage: weaponDamage.replace(new RegExp('Str\.|Str',"gi"), '@str+'),
                range: range,
                rof: rof,
                ap: ap
            };
            weapon.img = "systems/swade/assets/icons/weapon.svg";
            return weapon;
        }
    } catch (error) {
        log(`Could not build weapon: ${error}`)
    }
}

export const ShieldBuilder = async function (shieldName, description, parry = 0, cover = 0) {
    var shieldFromCompendium = await GetItemFromCompendium(SwadeItems.SHIELD, shieldName);
    try {
        if (shieldFromCompendium != undefined) {
            return shieldFromCompendium;
        } else {
            let shield = {};
            shield.name = capitalize(shieldName);
            shield.type = SwadeItems.SHIELD
            shield.data = {
                description: description,
                equipped: true,
                equippable: true,
                parry: parry,
                cover: cover
            };
            shield.img = "systems/swade/assets/icons/shield.svg";
            return shield;
        }
    } catch (error) {
        log(`Could not build shield: ${error}`)
    }

}

export const ArmorBuilder = async function (armorName, armorBonus, armorDescription) {
    var armorFromCompendium = await GetItemFromCompendium(SwadeItems.ARMOR, armorName);
    try {
        if (armorFromCompendium != undefined) {
            return armorFromCompendium;
        } else {
            let armor = {};
            armor.name = capitalize(armorName);
            armor.type = SwadeItems.ARMOR
            armor.data = {
                description: armorDescription,
                armor: parseInt(armorBonus),
                equipped: true,
                equippable: true,
            };
            armor.img = "systems/swade/assets/icons/armor.svg";
            return armor;
        }
    } catch (error) {
        log(`Could not build armor: ${error}`)
    }
}

export const GearBuilder = async function (gearName, description) {
    var gearFromCompendium = await GetItemFromCompendium(SwadeItems.GEAR, gearName);
    try {
        if (gearFromCompendium != undefined) {
            return gearFromCompendium;
        } else {
            let gear = {};
            gear.name = capitalize(gearName);
            gear.type = SwadeItems.GEAR
            gear.data = {
                description: description,
                equipped: false,
                equippable: false,
            };
            gear.img = "systems/swade/assets/icons/gear.svg";
            return gear;
        }
    } catch (error) {
        log(`Could not build gear: ${error}`)
    }
}

export const additionalStatsBuilder = function(additionalStatName, additionalStatValue){
    let gameAditionalStat = getSpecificAdditionalStat(additionalStatName);
    if (gameAditionalStat !== undefined) {
        gameAditionalStat['value'] = additionalStatValue;
        return gameAditionalStat;
    }
}
