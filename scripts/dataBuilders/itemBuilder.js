import { getItemFromCompendium, getSpecificAdditionalStat } from "../utils/foundryActions.js";
import { log } from "../global.js";
import { capitalizeEveryWord } from "../utils/textUtils.js";

export const SkillBuilder = async function (skillsDict) {
    if (skillsDict != undefined) {
        var allSkills = [];
        for (const skillName in skillsDict) {
            var skillFromComp = {};
            if (skillName.startsWith(game.i18n.localize("npcImporter.parser.Knowledge").toLowerCase())) {
                skillFromComp = await getItemFromCompendium(skillName, 'skill');
            } else {
                skillFromComp = await getItemFromCompendium(skillName.split('(')[0].trim(), 'skill');
            }
            try {
                allSkills.push({
                    type: "skill",
                    name: capitalizeEveryWord(skillName),
                    img: skillFromComp?.data?.img ?? "systems/swade/assets/icons/skill.svg",
                    data: {
                        description: skillFromComp?.data?.data.description ?? '',
                        notes: skillFromComp?.data?.data.notes ?? '',
                        additionalStats: skillFromComp?.data?.data.additionalStats ?? {},
                        attribute: skillFromComp?.data?.data.attribute ?? '',
                        isCoreSkill: skillFromComp?.data?.data.isCoreSkill ?? false,
                        die: {
                            sides: skillsDict[skillName].die.sides,
                            modifier: skillsDict[skillName].die.modifier
                        },
                    }
                });
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
            let edgeName = edges[i].trim();
            if (edgeName.includes(game.i18n.localize("npcImporter.parser.Imp"))) {
                edgeName = edgeName.replace(game.i18n.localize("npcImporter.parser.Imp"), '');
                edgeName = `${game.i18n.localize("npcImporter.parser.Improved")} ${edgeName}`.trim();
            }
            var cleanedName = '';
            if (new RegExp(game.i18n.localize("npcImporter.parser.Arcane")).test(edgeName)) {
                cleanedName = edgeName;
            } else {
                cleanedName = edgeName.split('(')[0].trim();
            }

            const { data } = await getItemFromCompendium(cleanedName, 'edge');
            try {
                allEdges.push({
                    type: "edge",
                    name: capitalizeEveryWord(edgeName),
                    img: data?.img ?? "systems/swade/assets/icons/edge.svg",
                    data: {
                        description: data?.data?.description ?? '',
                        notes: data?.data?.notes ?? '',
                        additionalStats: data?.data?.additionalStats ?? {},
                        isArcaneBackground: data?.data?.isArcaneBackground ?? new RegExp(game.i18n.localize("npcImporter.parser.Arcane")).test(edgeName),
                        requirements: {
                            value: data?.data?.requirements.value ?? ''
                        }
                    },
                });
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
            let hindranceName = hindrances[i].trim();
            let isMajor = RegExp(`\\(${game.i18n.localize("npcImporter.parser.Major")}`).test(hindranceName);
            hindranceName = hindranceName.replace(majorMinor, '').replace('()', '').trim();
            const { data } = await getItemFromCompendium(hindranceName.split('(')[0].trim(), 'hindrance');
            try {
                allHindrances.push({
                    type: "hindrance",
                    name: capitalizeEveryWord(hindranceName),
                    img: data?.img ?? "systems/swade/assets/icons/hindrance.svg",
                    data: {
                        description: data?.data?.description ?? '',
                        notes: data?.data?.notes ?? '',
                        additionalStats: data?.data?.additionalStats ?? {},
                        major: data?.data?.major ?? isMajor,
                    },
                });
            } catch (error) {
                log(`Could not build hindrance: ${error}`)
            }
        }

        return allHindrances;
    }
}

export const AbilityBuilder = async function (abilityName, abilityDescription) {
    const doesGrantPowers = new RegExp(`${game.i18n.localize("npcImporter.parser.PowerPoints")}|${game.i18n.localize("npcImporter.parser.Powers")}`).test(abilityDescription);
    const { data } = await getItemFromCompendium(abilityName, 'ability');
    const desc = data?.data?.description ? `${abilityDescription.trim()}<hr>${data?.data?.description}` : abilityDescription
    try {
        return {
            type: "ability",
            name: capitalizeEveryWord(abilityName),
            img: data?.img ?? "systems/swade/assets/icons/ability.svg",
            data: {
                description: desc,
                notes: data?.data?.notes ?? '',
                additionalStats: data?.data?.additionalStats ?? {},
                subtype: "special",
                grantsPowers: data?.data?.grantsPowers ?? doesGrantPowers
            }
        }
    } catch (error) {
        log(`Could not build ability: ${error}`)
    }
}

export const ItemBuilderFromSpecAbs = async function (name, itemDescription, type) {
    let cleanName = checkSpecificItem(name).trim();
    var itemFromCompendium = await getItemFromCompendium(cleanName, type);
    if (itemFromCompendium == undefined) {
        itemFromCompendium = await getItemFromCompendium(cleanName.split('(')[0].trim(), type);
    }

    const item = {
        type: type,
        name: itemFromCompendium?.data?.name ?? capitalizeEveryWord(name.trim()),
        img: itemFromCompendium?.data?.img ?? `systems/swade/assets/icons/${type}.svg`,
        data: (itemFromCompendium?.data?.data && itemFromCompendium?.type === type) ? itemFromCompendium?.data?.data : { description: itemDescription.trim() }
    };
    if (itemFromCompendium?.type === type) {
        item.data.description = `${itemDescription.trim()}<hr>${itemFromCompendium?.data?.data.description}`
    }
    return item;
}


export const PowerBuilder = async function (powers) {
    if (powers != undefined) {
        var allPowers = [];
        for (let i = 0; i < powers.length; i++) {
            const powerName = powers[i].trim();
            const { data } = await getItemFromCompendium(powerName, 'power');
            try {
                return {
                    type: "power",
                    name: capitalizeEveryWord(powerName),
                    img: data?.img ?? "systems/swade/assets/icons/power.svg",
                    data: data?.data ?? {}
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
    const { data } = await getItemFromCompendium(weaponName, 'weapon');
    try {
        return {
            type: "weapon",
            name: data?.name ?? capitalizeEveryWord(weaponName),
            img: data?.img ?? "systems/swade/assets/icons/weapon.svg",
            data: {
                description: data?.data?.description ?? description,
                equippable: true,
                equipped: true,
                damage: data?.data?.damage ?? dmg,
                range: data?.data?.range ?? range,
                rof: data?.data?.rof ?? rof,
                ap: data?.data?.ap ?? ap,
                actions: {
                    skill: range === '' ? game.i18n.localize("npcImporter.parser.Fighting") : game.i18n.localize("npcImporter.parser.Shooting"),
                }
            }
        }
    } catch (error) {
        log(`Could not build weapon: ${error}`)
    }
}

export const ShieldBuilder = async function (shieldName, description, parry = 0, cover = 0) {
    const { data } = await getItemFromCompendium(shieldName, 'shield');
    try {
        return {
            type: "shield",
            name: data?.name ?? capitalizeEveryWord(shieldName),
            img: data?.img ?? "systems/swade/assets/icons/shield.svg",
            data: {
                description: data?.description ?? description,
                notes: data?.data?.notes ?? '',
                additionalStats: data?.data?.additionalStats ?? {},
                equipped: true,
                equippable: true,
                parry: data?.data?.parry ?? parry,
                cover: data?.data?.cover ?? cover
            },
        }
    } catch (error) {
        log(`Could not build shield: ${error}`)
    }

}

export const ArmorBuilder = async function (armorName, armorBonus, armorDescription) {
    var cleanName = checkSpecificItem(armorName);
    const { data } = await getItemFromCompendium(cleanName, 'armor');
    const desc = (data?.description?.length > 0) ? `${armorDescription}<hr>${data?.data?.description}` : armorDescription;
    try {
        return {
            type: "armor",
            name: data?.name ?? capitalizeEveryWord(armorName),
            img: data?.img ?? "systems/swade/assets/icons/armor.svg",
            data: {
                description: desc,
                notes: data?.data?.notes ?? '',
                additionalStats: data?.data?.additionalStats ?? {},
                equipped: true,
                equippable: true,
                armor: data?.data?.armor ?? armorBonus
            }
        }
    } catch (error) {
        log(`Could not build armor: ${error}`)
    }
}

export const GearBuilder = async function (gearName, description) {
    const { data } = await getItemFromCompendium(gearName, 'gear');
    try {
        return {
            type: "gear",
            name: data?.name ?? capitalizeEveryWord(gearName),
            img: data?.img ?? "systems/swade/assets/icons/gear.svg",
            data: {
                description: data?.data?.description ?? description,
                equipped: false,
                equippable: false,
            },
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

    const item = data.match(abilitiesWithMod);

    if (item != null) {
        return item[0];
    }
    return data;
}
