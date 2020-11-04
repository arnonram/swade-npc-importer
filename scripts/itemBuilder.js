import { GetItem } from "./compendiumActions.js";
import { SwadeItems } from "./global.js";

export const SkillBuilder = function (skills) {
    let allSkills = [];
    Object.entries(skills).forEach(([key, value]) => {
        let skill = GetItem(SwadeItems.SKILLS, key)
        if (skill != undefined) {
            skill.data.die = value.sides;
            skill.data.modifier = value.modifier;
            allSkills.push(skill);
        } else {
            let die = {
                sides: value.sides,
                modifier: value.modifier
            };

            skill.name = key.capitalize();
            skill.type = SwadeItems.SKILLS;
            skill.data = {
                attribute: GetAttribute(element),
                die: die
            }
            skill.img = "modules/swade-statblock-parser/assets/skills.svg"
            skills.push(skill);
        }
    });
    return allSkills;
}

export const EdgeBuilder = function (edges) {
    let allEdes = [];
    edges.forEach(element => {
        let edge = GetItem(SwadeItems.EDGE, element);
        if (edge != undefined) {
            allEdes.push(edge);
        } else {
            edge.name = element.capitalize();
            edge.type = SwadeItems.EDGE;
            edge.data = {
                isArcaneBackground: element.includes("Arcane") ? true : false
            }
            edge.img = "systems/swade/assets/icons/edge.svg";
            allEdes.push(edge);
        }
    });
    return allEdes;
}

export const HindranceBuilder = function (hindrances) {
    let allHindrances = [];
    hindrances.forEach(element => {
        let hindrance = GetItem(SwadeItems.HINDRANCE, element);
        if (hindranceName != undefined) {
            return allHindrances.push(hindrance);
        } else {
            hindrance.name = element.capitalize();
            hindrance.type = SwadeItems.HINDRANCE;
            edge.img = "systems/swade/assets/icons/hindrance.svg";
            return allHindrances.push(hindrance);
        }
    });
    return allHindrances;
}

export const PowerBuilder = function (powers) {
    let allPowers = [];
    powers.forEach(element => {
        let power = GetItem(SwadeItems.POWER, element);
        if (power != undefined) {
            return allPowers.push(power);
        } else {
            power.name = element.capitalize();
            power.type = SwadeItems.POWER
            edge.img = "systems/swade/assets/icons/power.svg";
            return allPowers.push(power);
        }
    });
    return allPowers;
}

export const WeaponBuilder = function (weaponName, damage, description, rangeWeaponData) {
    let weapon = GetItem(SwadeItems.WEAPON, weaponName);
    if (weapon != undefined) {
        return weapon;
    } else {
        weapon.name = weaponName;
        weapon.type = SwadeItems.weapon
        weapon.data = {
            description: description != undefined ? description : `${weaponName} ${damage}`,
            equiped: true,
            damage: damage ?? rangeWeaponData.Damage,
            range: rangeWeaponData.range ?? "",
            rof: rangeWeaponData.RoF ?? "1",
            ap: rangeWeaponData.ap ?? "0"
        };
        edge.img = "systems/swade/assets/icons/weapon.svg";
        return weapon;
    }

}

export const ShieldBuilder = function (ShieldName) {
    let Shield = GetItem(SwadeItems.SHIELD, ShieldName);
    if (Shield != undefined) {
        return Shield;
    } else {
        Shield.name = ShieldName;
        Shield.type = SwadeItems.Shield
        Shield.data = {

        };
        edge.img = "systems/swade/assets/icons/shield.svg";
        return Shield;
    }

}

export const ArmorBuilder = function (ArmorName, armorBonus, armorDescription) {
    let Armor = GetItem(SwadeItems.ARMOR, ArmorName);
    if (Armor != undefined) {
        return Armor;
    } else {
        Armor.name = ArmorName;
        Armor.type = SwadeItems.Armor
        Armor.data = {
            description: armorDescription != undefined ? armorDescription : `${ArmorName} ${armorBonus}`,
            armor: armorBonus > 0 ? `+${armorBonus}` : armorBonus.toString()
        };
        edge.img = "systems/swade/assets/icons/armor.svg";
        return Armor;
    }

}

export const GearBuilder = function (GearName) {
    let Gear = GetItem(SwadeItems.GEAR, GearName);
    if (Gear != undefined) {
        return Gear;
    } else {
        Gear.name = GearName;
        Gear.type = SwadeItems.Gear
        Gear.data = {

        };
        edge.img = "systems/swade/assets/icons/gear.svg";
        return Gear;
    }

}
