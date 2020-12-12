import { getItemFromCompendium, getSpecificAdditionalStat } from "../utils/foundryActions.js";
import { log } from "../global.js";
import { capitalize } from "../utils/textUtils.js";

export const SkillBuilder = async function (skillsDict) {
    if (skillsDict != undefined) {
        var allSkills = [];
        for (const element in skillsDict) {
            var skillFromComp = await getItemFromCompendium(element);
            try {
                if (skillFromComp == undefined) {
                    let skill = {};
                    let die = {
                        sides: skillsDict[element].sides,
                        modifier: skillsDict[element].modifier
                    };

                    skill.name = capitalize(element);
                    skill.type = "skill";
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
            var edgeFromCompendium = await getItemFromCompendium(element);
            try {
                if (edgeFromCompendium != undefined) {
                    allEdges.push(edgeFromCompendium);
                } else {
                    let edge = {};
                    edge.name = capitalize(element)
                    edge.type = "edge";
                    edge.data = {
                        isArcaneBackground: element.includes(game.i18n.localize("npcImporter.parser.Arcane")) ? true : false
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
            var hindranceFromCompendium = await getItemFromCompendium(element);
            try {
                if (hindranceFromCompendium != undefined) {
                    allHindrances.push(hindranceFromCompendium);
                } else {
                    let hindrance = {};
                    hindrance.name = capitalize(element);
                    hindrance.type = "hindrance";
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
            var powerFromCompendium = await getItemFromCompendium(element);
            try {
                if (powerFromCompendium != undefined) {
                    allPowers.push(powerFromCompendium);
                } else {
                    let power = {};
                    power.name = capitalize(element);
                    power.type = "power";
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
    var weaponFromCompendium = await getItemFromCompendium(weaponName);
    try {
        if (weaponFromCompendium != undefined) {
            return weaponFromCompendium;
        } else {
            let weapon = {};
            weapon.name = capitalize(weaponName);
            weapon.type = "weapon";
            weapon.data = {
                description: description,
                equippable: true,
                equipped: true,
                damage: weaponDamage.replace(new RegExp(`${game.i18n.localize("npcImporter.parser.Str")}\\.|${game.i18n.localize("npcImporter.parser.Str")}`,"gi"), '@str'),
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
    var shieldFromCompendium = await getItemFromCompendium(shieldName);
    try {
        if (shieldFromCompendium != undefined) {
            return shieldFromCompendium;
        } else {
            let shield = {};
            shield.name = capitalize(shieldName);
            shield.type = "shield";
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
    var armorFromCompendium = await getItemFromCompendium(armorName);
    try {
        if (armorFromCompendium != undefined) {
            return armorFromCompendium;
        } else {
            let armor = {};
            armor.name = capitalize(armorName);
            armor.type = "armor";
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
    var gearFromCompendium = await getItemFromCompendium(gearName);
    try {
        if (gearFromCompendium != undefined) {
            return gearFromCompendium;
        } else {
            let gear = {};
            gear.name = capitalize(gearName);
            gear.type = "gear";
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