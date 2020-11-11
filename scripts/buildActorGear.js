import { WeaponBuilder, ArmorBuilder, GearBuilder } from "./itemBuilder.js";
import { armorModRegex, meleeDamageRegex, GetMeleeDamage, GetArmorBonus } from "./global.js";

export const ItemGearBuilder = async function (gear) {
    let gearItems = [];
    for (const item in gear) {
        if (gear[item] == null) { // check for other gear
            gearItems.push(await GearBuilder(item));
        } else if (Object.keys(gear[item]).length > 0 && Object.keys(gear[item]).includes("Range")) { //check for ranged weapon
            gearItems.push(await WeaponBuilder(item, gear[item], gear[item]['Damage'], gear[item]['Range'], gear[item]['RoF'], gear[item]['AP']))
        } else if (gear[item].match(meleeDamageRegex)) { // check for melee weapons
            let meleeDamage = GetMeleeDamage(gear[item]);
            gearItems.push(await WeaponBuilder(item, gear[item], meleeDamage));
        } else if (gear[item].match(armorModRegex)) { // check for armor
            let armorBonus = GetArmorBonus(gear[item]);
            gearItems.push(await ArmorBuilder(item, armorBonus, gear[item]));
        }
    }
    return gearItems;
}

