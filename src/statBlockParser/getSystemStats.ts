import { newLineRegex } from '../global';
import { getActorAddtionalStats } from '../utils/foundryActions';
import { buildTraitDie } from './parserBuilderHelpers';

export function getSystemDefinedStats(sections: string[]): Record<string, any> {
  const additionalStats = getActorAddtionalStats();
  const systemStats: Record<string, any> = {};

  for (const key in additionalStats) {
    if (!Object.prototype.hasOwnProperty.call(additionalStats, key)) continue;

    const { label, dtype } = additionalStats[key];
    const sectionLine = sections.find(line => line.startsWith(label));
    if (!sectionLine) continue;

    const cleanLine = sectionLine.replace(newLineRegex, ' ');
    const [statKey, statValueRaw] = cleanLine.split(':');

    if (!statKey || statValueRaw === undefined) continue;

    const statValue = statValueRaw.replace(';', '').trim();

    switch (dtype) {
      case 'String':
        systemStats[statKey.trim()] = statValue;
        break;
      case 'Number':
        systemStats[statKey.trim()] = parseInt(statValue, 10);
        break;
      case 'Die':
        systemStats[statKey.trim()] = buildTraitDie(statValue);
        break;
      default:
        console.warn(`Unhandled data type: ${dtype}`);
        break;
    }
  }

  return systemStats;
}
