import {
  weaponBuilder,
  armorBuilder,
  gearBuilder,
  shieldBuilder,
} from './itemBuilders';

function getItemType(data: any) {
  if (data == null) return 'gear';
  if (typeof data === 'object') {
    if ('damage' in data || 'range' in data) return 'weapon';
    if ('armorBonus' in data) return 'armor';
    if ('parry' in data) return 'shield';
  }
  return 'gear';
}

export async function itemGearBuilder(gear: Record<string, any>) {
  if (!gear || typeof gear !== 'object') return [];

  const gearItems = await Promise.all(
    Object.entries(gear).map(async ([name, data]) => {
      switch (getItemType(data)) {
        case 'weapon':
          return weaponBuilder({
            weaponName: name,
            weaponDescription: name,
            weaponDamage: data.damage,
            range: data.range,
            rof: data.rof,
            ap: data.ap,
            shots: data.shots,
          });
        case 'armor':
          return armorBuilder(name, data.armorBonus, name);
        case 'shield':
          return shieldBuilder(name, name, data.parry, data.cover);
        default:
          return gearBuilder(name);
      }
    }),
  );

  return gearItems;
}
