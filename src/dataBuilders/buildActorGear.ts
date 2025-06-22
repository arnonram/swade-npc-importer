import {
  weaponBuilder,
  armorBuilder,
  gearBuilder,
  shieldBuilder,
} from './itemBuilder.js';

export async function itemGearBuilder(gear: Record<string, any>) {
  if (!gear || typeof gear !== 'object') return [];

  const gearItems: any[] = [];

  for (const [name, data] of Object.entries(gear)) {
    if (data == null) {
      // Misc gear
      gearItems.push(await gearBuilder(name));
    } else if ('damage' in data || 'range' in data) {
      // Weapon
      gearItems.push(
        await weaponBuilder({
          weaponName: name,
          weaponDescription: name,
          weaponDamage: data.damage,
          range: data.range,
          rof: data.rof,
          ap: data.ap,
          shots: data.shots,
        }),
      );
    } else if ('armorBonus' in data) {
      // Armor
      gearItems.push(await armorBuilder(name, data.armorBonus, name));
    } else if ('parry' in data) {
      // Shield
      gearItems.push(await shieldBuilder(name, name, data.parry, data.cover));
    }
  }

  return gearItems;
}
