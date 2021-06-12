import { getItemFromCompendium, getSpecificAdditionalStat } from "../utils/foundryActions.js";
import { log } from "../global.js";
import { capitalize, capitalizeEveryWord } from "../utils/textUtils.js";

export const SkillBuilder = async function (skillsDict) {
    if (skillsDict != undefined) {
        var allSkills = [];
        for (const element in skillsDict) {
            var skillFromComp = {};
            if (element.startsWith(game.i18n.localize("npcImporter.parser.Knowledge").toLowerCase())) {
                skillFromComp = await getItemFromCompendium(element, 'skill');
            } else {
                skillFromComp = await getItemFromCompendium(element.split('(')[0].trim(), 'skill');
            }
            try {
                const dieData = {
                    sides: skillsDict[element].die.sides,
                    modifier: skillsDict[element].die.modifier
                };

                if (skillFromComp != undefined) {
                    skillFromComp.data.name = capitalizeEveryWord(element);
                    skillFromComp.data.data = {
                        die: dieData
                    }
                    allSkills.push(skillFromComp);
                } else {
                    allSkills.push({
                        data: {
                            name: capitalize(element),
                            type: "skill",
                            img: "systems/swade/assets/icons/skill.svg",
                            data: {
                                die: dieData,
                            }
                        }
                    });
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
            let element = edges[i].trim();
            if (element.includes(game.i18n.localize("npcImporter.parser.Imp"))) {
                element = element.replace(game.i18n.localize("npcImporter.parser.Imp"), '');
                element = `${game.i18n.localize("npcImporter.parser.Improved")} ${element}`.trim();
            }
            var cleanedName = '';
            if (new RegExp(game.i18n.localize("npcImporter.parser.Arcane")).test(element)) {
                cleanedName = element;
            } else {
                cleanedName = element.split('(')[0].trim();
            }

            var edgeFromCompendium = await getItemFromCompendium(cleanedName, 'edge');
            try {
                if (edgeFromCompendium != undefined) {
                    edgeFromCompendium.data.name = element;
                    allEdges.push(edgeFromCompendium);
                } else {
                    allEdges.push({
                        data: {
                            name: capitalize(element),
                            type: "edge",
                            data: {
                                isArcaneBackground: new RegExp(game.i18n.localize("npcImporter.parser.Arcane")).test(element)
                            },
                            img: "systems/swade/assets/icons/edge.svg"
                        }
                    });
                }
            } catch (error) {
                log(`Could not build edge: ${error}`)
            }
        }
        return allEdges;
    }
}

export const HindranceBuilder = async function (hindrances) {
    const majorMinor = new RegExp(`${game.i18n.localize("npcImporter.parser.Major")}(,)?\\s?|${game.i18n.localize("npcImporter.parser.Minor")}(,)?\\s?`);
    if (hindrances != undefined) {
        var allHindrances = [];
        for (let i = 0; i < hindrances.length; i++) {
            let element = hindrances[i].trim();
            let isMajor = RegExp(`\\(${game.i18n.localize("npcImporter.parser.Major")}`).test(element);
            element = element.replace(majorMinor, '').replace('()', '').trim();
            var hindranceFromCompendium = await getItemFromCompendium(element.split('(')[0].trim(), 'hindrance');
            try {
                if (hindranceFromCompendium != undefined) {
                    hindranceFromCompendium.data.name = element.replace('—', '').replace('-', '').trim();
                    hindranceFromCompendium.data.data.major = isMajor;
                    allHindrances.push(hindranceFromCompendium);
                } else {
                    allHindrances.push({
                        data: {
                            type: "hindrance",
                            name: capitalize(element),
                            data: {
                                major: isMajor,
                            },
                            img: "systems/swade/assets/icons/hindrance.svg",
                        }
                    });
                }
            } catch (error) {
                log(`Could not build hindrance: ${error}`)
            }
        }

        return allHindrances;
    }
}

export const AbilityBuilder = async function (abilityName, abilityDescription) {
    const doesGrantPowers = new RegExp(`${game.i18n.localize("npcImporter.parser.PowerPoints")}|${game.i18n.localize("npcImporter.parser.Powers")}`).test(abilityDescription);
    var abilityFromCompendium = await getItemFromCompendium(abilityName, 'ability');
    try {
        if (abilityFromCompendium != undefined) {
            abilityFromCompendium.data.description = `${abilityDescription.trim()}<hr>${abilityFromCompendium.data.description}`;
            return abilityFromCompendium;
        } else {
            return {
                data: {
                    type: "ability",
                    name: capitalize(abilityName),
                    data: {
                        description: abilityDescription,
                        subtype: "special",
                        grantsPowers: doesGrantPowers
                    },
                    img: "systems/swade/assets/icons/ability.svg"
                }
            };
        }
    } catch (error) {
        log(`Could not build ability: ${error}`)
    }
}

export const ItemBuilderFromSpecAbs = async function (name, desc, type) {
    let cleanName = checkSpecificItem(name).trim();
    var itemFromCompendium = await getItemFromCompendium(cleanName, type);
    if (itemFromCompendium == undefined) {
        itemFromCompendium = await getItemFromCompendium(cleanName.split('(')[0].trim(), type);
    }
    if (itemFromCompendium != undefined && itemFromCompendium.type === type) {
        itemFromCompendium.data.name = name;
        itemFromCompendium.data.data.description = `${desc.trim()}<hr>${itemFromCompendium.data.description}`;
        return itemFromCompendium;
    } else {
        return {
            data: {
                type: type,
                name: capitalize(name.trim()),
                img: `systems/swade/assets/icons/${type}.svg`,
                data: {
                    description: desc.trim()
                }
            }
        };
    }
}

export const PowerBuilder = async function (powers) {
    if (powers != undefined) {
        var allPowers = [];
        for (let i = 0; i < powers.length; i++) {
            const element = powers[i].trim();
            var powerFromCompendium = await getItemFromCompendium(element, 'power');
            try {
                if (powerFromCompendium != undefined) {
                    allPowers.push(powerFromCompendium);
                } else {
                    allPowers.push({
                        data: {
                            type: "power",
                            name: capitalize(element),
                            img: "systems/swade/assets/icons/power.svg"
                        }
                    });
                }
            } catch (error) {
                log(`Could not build power: ${error}`)
            }
        }
        return allPowers;
    }
}

export const WeaponBuilder = async function (weaponName, description, weaponDamage, range = '', rof = '', ap = '') {
    const dmg = weaponDamage.replace(new RegExp(`${game.i18n.localize("npcImporter.parser.Str")}\\.|${game.i18n.localize("npcImporter.parser.Str")}`, "gi"), '@str');
    var weaponFromCompendium = await getItemFromCompendium(weaponName, 'weapon');
    try {
        if (weaponFromCompendium != undefined) {
            weaponFromCompendium.data.data.damage = dmg != undefined ? dmg : weaponFromCompendium.data.damage;
            weaponFromCompendium.data.data.equipped = true;
            if (description != undefined && description.length > 0) {
                weaponFromCompendium.data.data.description = `${description}<hr>${weaponFromCompendium.data.description}`;
            }
            return weaponFromCompendium;
        } else {
            return {
                data: {
                    name: capitalize(weaponName),
                    type: "weapon",
                    data: {
                        description: description,
                        equippable: true,
                        equipped: true,
                        damage: dmg,
                        range: range,
                        rof: rof,
                        ap: ap,
                        actions: {
                            skill: range === '' ? game.i18n.localize("npcImporter.parser.Fighting") : game.i18n.localize("npcImporter.parser.Shooting"),
                        }
                    },
                    img: "systems/swade/assets/icons/weapon.svg"
                }
            };
        }
    } catch (error) {
        log(`Could not build weapon: ${error}`)
    }
}

export const ShieldBuilder = async function (shieldName, description, parry = 0, cover = 0) {
    var shieldFromCompendium = await getItemFromCompendium(shieldName, 'shield');
    try {
        if (shieldFromCompendium != undefined) {
            shieldFromCompendium.data.data.equipped = true;
            return shieldFromCompendium;
        } else {
            return {
                data: {
                    name: capitalize(shieldName),
                    type: "shield",
                    data: {
                        description: description,
                        equipped: true,
                        equippable: true,
                        parry: parry,
                        cover: cover
                    },
                    img: "systems/swade/assets/icons/shield.svg"
                }
            };
        }
    } catch (error) {
        log(`Could not build shield: ${error}`)
    }

}

export const ArmorBuilder = async function (armorName, armorBonus, armorDescription) {
    var cleanName = checkSpecificItem(armorName);
    var armorFromCompendium = await getItemFromCompendium(cleanName, 'armor');
    try {
        if (armorFromCompendium != undefined) {
            armorFromCompendium.data.name = armorName;
            armorFromCompendium.data.data.equipped = true;
            if (armorDescription != undefined || armorDescription.length > 0) {
                armorFromCompendium.data.data.description = `${armorDescription.trim()}<hr>${armorFromCompendium.data.description}`;
            }
            if (armorBonus != 0) {
                armorFromCompendium.data.data.armor = armorBonus;
            }
            return armorFromCompendium;
        } else {
            return {
                data: {
                    name: capitalize(armorName),
                    type: "armor",
                    data: {
                        description: armorDescription,
                        armor: parseInt(armorBonus),
                        equipped: true,
                        equippable: true,
                    },
                    img: "systems/swade/assets/icons/armor.svg"
                }
            };
        }
    } catch (error) {
        log(`Could not build armor: ${error}`)
    }
}

export const GearBuilder = async function (gearName, description) {
    var gearFromCompendium = await getItemFromCompendium(gearName, 'gear');
    try {
        if (gearFromCompendium != undefined) {
            return gearFromCompendium;
        } else {
            return {
                data: {
                    name: capitalize(gearName),
                    type: "gear",
                    data: {
                        description: description,
                        equipped: false,
                        equippable: false,
                    },
                    img: "systems/swade/assets/icons/gear.svg"
                }
            };
        }
    } catch (error) {
        log(`Could not build gear: ${error}`)
    }
}

export const additionalStatsBuilder = function (additionalStatName, additionalStatValue) {
    let gameAditionalStat = getSpecificAdditionalStat(additionalStatName);
    if (gameAditionalStat !== undefined) {
        gameAditionalStat['value'] = additionalStatValue;
        return gameAditionalStat;
    }
}

function checkSpecificItem(data) {
    const abilitiesWithMod = new RegExp(
        `${game.i18n.localize("npcImporter.parser.Armor")}|${game.i18n.localize("npcImporter.parser.Size")}|${game.i18n.localize("npcImporter.parser.Fear")}|${game.i18n.localize("npcImporter.parser.Weakness")}$`);

    let item = data.match(abilitiesWithMod);

    if (item != null) {
        return item[0];
    }
    return data;
}

