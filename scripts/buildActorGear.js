import { WeaponBuilder, ArmorBuilder, GearBuilder, ShieldBuilder } from "./itemBuilder.js";
import * as global from "./global.js";

export const ItemGearBuilder = async function (gear) {
    let gearItems = [];
    for (const item in gear) {
        if (gear[item] == null) {                                                                       // check for other gear
            gearItems.push(await GearBuilder(item));
        } else if (Object.keys(gear[item]).length > 0 && Object.keys(gear[item]).includes("Range")) {   //check for ranged weapon
            gearItems.push(await WeaponBuilder(item, gear[item], gear[item]['Damage'], gear[item]['Range'], gear[item]['RoF'], gear[item]['AP']))
        } else if (gear[item].match(global.meleeDamageRegex)) {                                         // check for melee weapons
            let meleeDamage = global.GetMeleeDamage(gear[item]);
            gearItems.push(await WeaponBuilder(item, gear[item], meleeDamage));
        } else if (gear[item].match(global.armorModRegex)) {                                            // check for armor
            let armorBonus = global.GetArmorBonus(gear[item]);
            gearItems.push(await ArmorBuilder(item, armorBonus, gear[item]));
        } else if (gear.toLowerCase().includes('shield')){                                              //check for shield
            let parry = global.GetParryBonus(gear[item]);
            let cover = global.GetCoverBonus(getC[item]);
            gearItems.push(await ShieldBuilder(item, gear[item], parry, cover))
        }
    }
    return gearItems;
}

