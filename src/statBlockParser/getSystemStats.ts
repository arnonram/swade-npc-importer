import { newLineRegex } from '../global';
import { getActorAddtionalStats } from '../utils/foundryActions';

export function getSystemDefinedStats(sections: string[]): Record<string, any> {
  let additionalStats = getActorAddtionalStats();
  let systemStats: Record<string, any> = {};
  for (const key in additionalStats) {
    if (additionalStats.hasOwnProperty(key)) {
      const element = additionalStats[key];
      let stat = sections.find(x => x.startsWith(element.label));
      if (stat != undefined) {
        stat = stat.replace(newLineRegex, ' ');
        const statParts = stat.split(':');
        if (element.dtype === 'String') {
          systemStats[statParts[0]] = statParts[1].replace(';', '').trim();
        } else if (element.dtype === 'Number') {
          systemStats[statParts[0]] = parseInt(
            statParts[1].replace(';', '').trim().replace('–', '-'),
          );
        } else if (element.dtype === 'Boolean') {
          systemStats[statParts[0]] =
            statParts[1].replace(';', '').trim() == 'true';
        }
      }
    }
  }
  return systemStats;
}
