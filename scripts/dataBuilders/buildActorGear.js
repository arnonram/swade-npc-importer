import { WeaponBuilder, ArmorBuilder, GearBuilder, ShieldBuilder } from "./itemBuilder.js";

export const ItemGearBuilder = async function (gear) {
    let gearItems = [];
    for (const item in gear) {
        if (gear[item] == null) {                                 // check for other gear
            gearItems.push(await GearBuilder(item));
        } else if (Object.keys(gear[item]).includes("range") || Object.keys(gear[item]).includes("damage")) {  // check for weapon
            gearItems.push(await WeaponBuilder({weaponName: item, weaponDescription: item, weaponDamage: gear[item]['damage'], range: gear[item]['range'], rof: gear[item]['rof'], ap: gear[item]['ap'], shots: gear[item]['shots']}))
        } else if (Object.keys(gear[item]).includes("armorBonus")) {      // check for armor
            gearItems.push(await ArmorBuilder(item, gear[item]['armorBonus'], item));
        } else if (Object.keys(gear[item]).includes("parry")){        //check for shield
            gearItems.push(await ShieldBuilder(item, item, gear[item]['parry'], gear[item]['cover']))
        }
    }
    return gearItems;
}

