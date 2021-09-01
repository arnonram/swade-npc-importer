import { WeaponBuilder, ArmorBuilder, GearBuilder, ShieldBuilder } from "./itemBuilder.js";

export const ItemGearBuilder = async function (gear) {
    let gearItems = [];
    for (const item in gear) {
        if (gear[item] == null) {                                 // check for other gear
            gearItems.push(await GearBuilder(item));
        } else if (Object.keys(gear[item]).includes("range")) {   //check for ranged weapon
            gearItems.push(await WeaponBuilder(item, item, gear[item]['damage'], gear[item]['range'], gear[item]['rof'], gear[item]['ap'], gear[item]['shots']))
        } else if (Object.keys(gear[item]).includes("damage")) {   // check for melee weapons
            gearItems.push(await WeaponBuilder(item, item, gear[item]['damage']));
        } else if (Object.keys(gear[item]).includes("armorBonus")) {      // check for armor
            gearItems.push(await ArmorBuilder(item, gear[item]['armorBonus'], item));
        } else if (Object.keys(gear[item]).includes("parry")){        //check for shield
            gearItems.push(await ShieldBuilder(item, item, gear[item]['parry'], gear[item]['cover']))
        }
    }
    return gearItems;
}

